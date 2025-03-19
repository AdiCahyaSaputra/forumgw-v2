<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		replyCommentRequest,
		deleteReplyCommentRequest,
		commentRequest,
		deleteCommentRequest
	} from '$lib/trpc/schema/commentSchema';
	import { timeAgo } from '$lib/utils';
	import { ChevronDown, ChevronRight, EllipsisVertical, PencilLine, Trash2 } from '@lucide/svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import CreateReplyCommentForm from './CreateReplyCommentForm.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import EditCommentDialog from './EditCommentDialog.svelte';

	type Props = {
		comment: {
			id: number;
			text: string;
			postId: string;
			user: {
				name: string;
				username: string;
				image: string | null;
			};
			createdAt: Date;
			_count: {
				replies: number;
			};
		};
		formEditComment: SuperValidated<Infer<ReturnType<typeof commentRequest>>>;
		formDeleteComment: SuperValidated<Infer<typeof deleteCommentRequest>>;

		formReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
		formEditReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
		formDeleteReplyComment: SuperValidated<Infer<typeof deleteReplyCommentRequest>>;
	};

	const { 
    comment, 
		formEditComment,
		formDeleteComment,

		formReplyComment,
		formEditReplyComment,
		formDeleteReplyComment,
  }: Props = $props();

	let openReplyComment = $state(false);
	let repliesCount = $state(comment._count.replies);
	let openEditComment = $state(false);
</script>

<div class={['rounded-md border', openReplyComment && 'border-primary']}>
	<div class="flex justify-between items-start p-4 pb-2">
		<div class="flex items-start gap-2">
			<Avatar.Root class="rounded-md border m-0">
				<Avatar.Image src={comment.user?.image} alt="@shadcn" />
				<Avatar.Fallback class="bg-white">
					{#if comment.user}
						{comment.user?.username[0].toUpperCase()}
					{:else}
						A
					{/if}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex items-start grow justify-between">
				<div>
					<h3 class="text-sm leading-none font-bold">{comment.user.name}</h3>
					<a href={`/profil/${comment.user.username}`} class="text-sm hover:underline">
						{comment.user.username}
					</a>
				</div>
			</div>
		</div>

		<EditCommentDialog
			bind:openEditComment
			{formEditComment}
			postId={comment.postId}
			commentId={comment.id}
      text={comment.text}
		/>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" size="icon" {...props}>
						<EllipsisVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" side="left">
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer" onclick={() => (openEditComment = true)}>
						<PencilLine /> Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						class="data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive cursor-pointer"
					>
						<Trash2 /> Delete
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div class="px-4 pb-4">
		<small class="text-foreground/60">
			{m.comment_created_at()}
			{timeAgo(comment.createdAt)}
		</small>
		<p class="cst-wrap-text">{comment.text}</p>
	</div>

	<div>
		<Button
			onclick={() => (openReplyComment = !openReplyComment)}
			class="px-4 rounded-none w-full justify-between items-center border-x-0"
			variant="outline"
		>
			<span class="text-sm text-foreground/60">
				<span class="font-bold">{repliesCount}</span>&nbsp;{m.reply_comment()}
			</span>
			{#if openReplyComment}
				<ChevronDown />
			{:else}
				<ChevronRight />
			{/if}
		</Button>
	</div>
	<CreateReplyCommentForm
		{openReplyComment}
		{formReplyComment}
		defaultCommentText=""
		commentId={comment.id}
		bind:repliesCount
	/>
</div>

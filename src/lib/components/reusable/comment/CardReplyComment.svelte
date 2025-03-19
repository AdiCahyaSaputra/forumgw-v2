<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { timeAgo } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { EllipsisVertical, PencilLine, Trash2 } from '@lucide/svelte';
	import EditReplyCommentDialog from './EditReplyCommentDialog.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { replyCommentRequest } from '$lib/trpc/schema/commentSchema';
	import DeleteReplyCommentDialog from './DeleteReplyCommentDialog.svelte';

	type Props = {
		replyComment: {
			id: number;
			text: string;
			commentId: number;
			user: {
				name: string;
				username: string;
				image: string | null;
			};
			createdAt: Date;
		};
		formEditReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
	};

	const { replyComment, formEditReplyComment }: Props = $props();

	let openEditReplyComment = $state(false);
	let openDeleteReplyComment = $state(false);
</script>

<div class="border-b bg-slate-50">
	<div class="flex justify-between items-start p-4 pb-2">
		<div class="flex items-start gap-2">
			<Avatar.Root class="rounded-md border m-0">
				<Avatar.Image src={replyComment.user?.image} alt="@shadcn" />
				<Avatar.Fallback class="bg-white">
					{replyComment.user.username[0].toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex items-start grow justify-between">
				<div>
					<h3 class="text-sm leading-none font-bold">{replyComment.user.name}</h3>
					<a href={`/profil/${replyComment.user.username}`} class="text-sm hover:underline">
						{replyComment.user.username}
					</a>
				</div>
			</div>
		</div>

		<EditReplyCommentDialog
			bind:open={openEditReplyComment}
			{formEditReplyComment}
			text={replyComment.text}
			commentId={replyComment.commentId}
			replyCommentId={replyComment.id}
		/>

		<DeleteReplyCommentDialog bind:open={openDeleteReplyComment} replyCommentId={replyComment.id} />

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
					<DropdownMenu.Item class="cursor-pointer" onclick={() => (openEditReplyComment = true)}>
						<PencilLine /> Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						class="data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive cursor-pointer"
						onclick={() => (openDeleteReplyComment = true)}
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
			{timeAgo(replyComment.createdAt)}
		</small>
		<p class="cst-wrap-text">{replyComment.text}</p>
	</div>
</div>

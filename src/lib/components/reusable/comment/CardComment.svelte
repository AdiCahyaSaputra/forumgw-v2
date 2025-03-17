<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { replyCommentRequest } from '$lib/trpc/schema/commentSchema';
	import { timeAgo } from '$lib/utils';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import CreateReplyCommentForm from './CreateReplyCommentForm.svelte';

	type Props = {
		comment: {
			id: number;
			text: string;
			user: {
				name: string;
				username: string;
				image: string | null;
			};
			createdAt: Date;
      _count: {
        replies: number;
      }
		};
		formReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
	};

	const { comment, formReplyComment }: Props = $props();

	let openReplyComment = $state(false);
  let repliesCount = $state(comment._count.replies);
</script>

<div class={['rounded-md border', openReplyComment && 'border-primary']}>
	<div class="flex items-start gap-2 p-4 pb-2">
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

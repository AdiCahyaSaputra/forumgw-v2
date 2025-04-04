<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { replyCommentRequest } from '$lib/trpc/schema/commentSchema';
	import { trpcClientUtils } from '$lib/utils';
	import { SendHorizonal } from '@lucide/svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoadingState from '../global/LoadingState.svelte';
	import CardReplyComment from './CardReplyComment.svelte';
	import CommentInput from './CommentInput.svelte';

	type Props = {
		openReplyComment: boolean;
		formReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
		formEditReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
		defaultCommentText: string;
		commentId: number;
		repliesCount: number;
	};

	let {
		openReplyComment,
		formReplyComment,
		formEditReplyComment,
		defaultCommentText,
		commentId,
		repliesCount = $bindable()
	}: Props = $props();

	let loadingReplyComment = $state(false);
	let formResult: ActionResult | null = $state(null);
	let mentionedUserIds: string[] = $state([]);

	let triggerMoreReplyCommentsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);

	let replyCommentFilter = writable({ commentId });

	let replies = trpc($page).comment.getReplyComments.createInfiniteQuery(replyCommentFilter, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor,
		enabled: () => openReplyComment && repliesCount > 0
	});

	let form = superForm(formReplyComment, {
		validators: zodClient(replyCommentRequest()),
		onSubmit: ({ formData }) => {
			loadingReplyComment = true;

			formData.append('mentionUsers', mentionedUserIds.join(','));
		},
		onResult: async ({ result }) => {
			formResult = result;
			loadingReplyComment = false;
			$formData.text = '';

			trpcClientUtils($page).comment.getPostComments.invalidate();
      $replies.refetch();

      // TODO: Trigger notification change using tRPC SSE (Server Send Event)
		},
		onUpdate: async ({ result }) => {
			if (result.type !== 'success') {
				toast.error(result.data?.message || m.global_error_message());
			}
		},
		resetForm: true
	});

	const { form: formData, enhance } = form;

	onMount(() => {
		$formData.text = defaultCommentText;
	});

	$effect(() => {
		if (isIntersecting) {
			$replies.fetchNextPage();
		}
	});
</script>

<div class="flex flex-col">
	{#if openReplyComment}
		<LoadingState isLoading={$replies.isLoading}>
			{#snippet loadingFallback()}
				<div class="p-4">
					<div class="w-full py-8 bg-secondary"></div>
				</div>
			{/snippet}

			{#if $replies.data}
				<div class="max-h-40 overflow-y-scroll">
					{#each $replies.data.pages.flatMap((page) => page.data.replies) as replyComment, idx (idx)}
						<CardReplyComment {replyComment} {formEditReplyComment} />
					{/each}

					{#if $replies.data.pages.at(-1)?.data.hasNextPage}
						<IntersectionObserver
							element={triggerMoreReplyCommentsElement}
							bind:intersecting={isIntersecting}
						>
							<div class="p-4" bind:this={triggerMoreReplyCommentsElement}>
								<div class="w-full py-8 bg-secondary"></div>
							</div>
						</IntersectionObserver>
					{/if}
				</div>
			{/if}
		</LoadingState>
		<div class="p-4 border-t">
			<form method="POST" use:enhance class="flex items-start gap-2" action="?/replyComment">
				<Form.Field {form} name="text" class="grow">
					<Form.Control>
						{#snippet children({ props })}
							<CommentInput
								bind:value={$formData.text}
								bind:mentionedUserIds
								{...props}
								placeholder={m.reply_comment_placeholder()}
								formResultType={formResult?.type}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Input name="commentId" value={commentId} class="hidden" />
				<Button size="icon" type="submit" disabled={loadingReplyComment}>
					<SendHorizonal />
				</Button>
			</form>
		</div>
	{/if}
</div>

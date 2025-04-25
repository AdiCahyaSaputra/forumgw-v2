<script lang="ts">
	import ConfirmDialog from '../global/ConfirmDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { trpcClientUtils } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { handleOptimisticUpdate, handleOnError } from '$lib/utils/optimistic';

	let { commentId, postId, open = $bindable(false) } = $props();

	const deleteComment = trpc().comment.deleteComment.createMutation({
		onMutate: async (deletedComment) => {
			open = false;

			await trpcClientUtils($page).comment.getPostComments.cancel();
			await trpcClientUtils($page).post.getPostDetail.cancel();

			const previousComments = trpcClientUtils($page).comment.getPostComments.getInfiniteData({
				postId
			});

			// @ts-ignore	(statusLoading cause type error)
			trpcClientUtils($page).comment.getPostComments.setInfiniteData({ postId }, (old) => {
					return handleOptimisticUpdate({
						previousData: old,
						operation: 'delete',
						entityData: {
							id: deletedComment.commentId
						},
						findIndex: (item) => item.id === deletedComment.commentId
					});
				}
			);

			return { previousComments };
		},
		onSettled: () => {
			trpcClientUtils($page).comment.getPostComments.invalidate();
			trpcClientUtils($page).post.getPostDetail.invalidate();

			open = false;
		},
		onError: (error, variables, context: unknown) => {
			handleOnError(context, (errCtx) => {
				trpcClientUtils($page).comment.getPostComments.setInfiniteData(
					{ postId },
					// @ts-ignore
					() => errCtx.previousResults
				);
			});
		}
	});
</script>

<ConfirmDialog
	bind:open
	title={m.delete_comment_dialog_title()}
	description={m.delete_comment_dialog_description()}
	submit={m.delete_comment_submit()}
	cancel={m.delete_comment_drawer_close()}
	onSubmit={() => {
		$deleteComment.mutate({
			commentId
		});
	}}
	isPending={$deleteComment.isPending}
/>

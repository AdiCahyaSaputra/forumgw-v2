<script lang="ts">
	import ConfirmDialog from '../global/ConfirmDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { trpcClientUtils } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let { 
    commentId,
    open = $bindable(false)
  } = $props();

	const deleteComment = trpc().comment.deleteComment.createMutation({
		onSuccess: () => {
			trpcClientUtils($page).comment.getPostComments.invalidate();
			trpcClientUtils($page).post.getPostDetail.invalidate();

      open = false;
		},
		onError: () => {
			toast.error(m.global_error_message());
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

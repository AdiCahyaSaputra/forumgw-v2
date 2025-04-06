<script lang="ts">
	import ConfirmDialog from '../global/ConfirmDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { trpcClientUtils } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let { 
    replyCommentId,
    open = $bindable(false)
  } = $props();

	const deleteReplyComment = trpc().comment.deleteReplyComment.createMutation({
		onSuccess: () => {
			trpcClientUtils($page).comment.getPostComments.invalidate();
			trpcClientUtils($page).comment.getReplyComments.invalidate();

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
		$deleteReplyComment.mutate({
      replyCommentId
		});
	}}
  isPending={$deleteReplyComment.isPending}
/>

<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { trpcClientUtils } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	type Props = {
		postId: string;
		groupId?: string;
	};

	let { postId, groupId }: Props = $props();

	let open = $state(false);

	let postMutate = trpc($page).post.deletePost.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			trpcClientUtils($page).post.getPublicPostDiscussions.invalidate();
			trpcClientUtils($page).tag.getAllTags.invalidate();

			open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$postMutate.reset();
		}
	});

	const handleDelete = () => {
		$postMutate.mutate({ postId, groupId });
	};
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
		<Trash2 />
		{m.post_form_delete_button()}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.post_form_delete_title()}</AlertDialog.Title>
			<AlertDialog.Description>{m.post_form_delete_description()}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.post_form_delete_cancel()}</AlertDialog.Cancel>
			<AlertDialog.Action disabled={$postMutate.isPending} onclick={handleDelete}
				>{m.post_form_delete_submit()}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

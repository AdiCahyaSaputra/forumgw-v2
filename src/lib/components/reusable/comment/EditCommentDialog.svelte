<script lang="ts">
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { commentRequest } from '$lib/trpc/schema/commentSchema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { trpcClientUtils } from '$lib/utils';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	type Props = {
		openEditComment: boolean;
		formEditComment: SuperValidated<Infer<ReturnType<typeof commentRequest>>>;
		text: string;
		postId: string;
		commentId: number;
	};

	let { openEditComment = $bindable(false), formEditComment, postId, commentId, text }: Props = $props();

	let editCommentLoading = $state(false);

	let form = superForm(formEditComment, {
		validators: zodClient(commentRequest()),
		onSubmit: ({ formData }) => {
			editCommentLoading = true;
		},
		onResult: async () => {
			editCommentLoading = false;
		},
		onUpdate: async ({ result }) => {
			switch (result.type) {
				case 'failure':
					toast.error(result.data?.message || m.global_error_message());
					break;
				case 'success':
					trpcClientUtils($page).comment.getPostComments.invalidate();

					openEditComment = false;
					break;
				default:
					toast.error(m.global_error_message());
			}
		},
		onError: () => {
			toast.error(m.global_error_message());
		}
	});

	const { form: formData, enhance } = form;

  onMount(() => {
    $formData.text = text;
  })
</script>

<ResponsiveDialog
	bind:open={openEditComment}
	title={m.edit_comment_dialog_title()}
	description={m.edit_comment_dialog_description()}
	drawerClose={m.edit_comment_drawer_close()}
>
	<form method="POST" action="?/editComment" use:enhance>
		<Form.Field {form} name="text">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						placeholder={m.comment_placeholder()}
						autocomplete="off"
						bind:value={$formData.text}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="postId" class="p-0 m-0">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} value={postId} class="hidden" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="commentId" class="p-0 m-0">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} value={commentId} class="hidden" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Button disabled={editCommentLoading} type="submit" class="mt-4 w-full">
			{m.edit_comment_submit()}
		</Button>
	</form>
</ResponsiveDialog>

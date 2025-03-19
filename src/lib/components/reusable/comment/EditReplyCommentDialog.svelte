<script lang="ts">
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { replyCommentRequest } from '$lib/trpc/schema/commentSchema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { trpcClientUtils } from '$lib/utils';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import CommentInput from './CommentInput.svelte';

	type Props = {
		open: boolean;
		formEditReplyComment: SuperValidated<Infer<ReturnType<typeof replyCommentRequest>>>;
		text: string;
		commentId: number;
		replyCommentId: number;
	};

	let { 
    open = $bindable(false), 
    formEditReplyComment, 
    commentId, 
    replyCommentId, 
    text 
  }: Props = $props();

	let editReplyLoading = $state(false);
	let formResult: ActionResult | null = $state(null);
	let mentionedUserIds: string[] = $state([]);

	let form = superForm(formEditReplyComment.data, {
		validators: zodClient(replyCommentRequest()),
		onSubmit: ({ formData }) => {
			editReplyLoading = true;

			formData.append('mentionUsers', mentionedUserIds.join(','));
		},
		onResult: async ({ result }) => {
			formResult = result;

			editReplyLoading = false;
		},
		onUpdate: async ({ result }) => {
			switch (result.type) {
				case 'failure':
					toast.error(result.data?.message || m.global_error_message());
					break;
				case 'success':
					trpcClientUtils($page).comment.getReplyComments.invalidate();

					open = false;
					break;
				default:
					toast.error(m.global_error_message());
			}

      formResult = null;
		},
		onError: () => {
			toast.error(m.global_error_message());
		}
	});

	const { form: formData, enhance } = form;

  onMount(() => {
    $formData.text = text;

    // Don't do anything if there is mentioned users on the old text 
  });
</script>

<ResponsiveDialog
	bind:open={open}
	title={m.edit_comment_dialog_title()}
	description={m.edit_comment_dialog_description()}
	drawerClose={m.edit_comment_drawer_close()}
>
	<form method="POST" action="?/editReplyComment" use:enhance>
		<Form.Field {form} name="text">
			<Form.Control>
				{#snippet children({ props })}
					<CommentInput
						bind:value={$formData.text}
						bind:mentionedUserIds
						formResultType={formResult?.type}
						defaultValue={text}
            placeholder={m.comment_placeholder()}
						{...props}
					/>
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

		<Form.Field {form} name="replyCommentId" class="p-0 m-0">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} value={replyCommentId} class="hidden" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Button disabled={editReplyLoading} type="submit" class="mt-4 w-full">
			{m.edit_comment_submit()}
		</Button>
	</form>
</ResponsiveDialog>

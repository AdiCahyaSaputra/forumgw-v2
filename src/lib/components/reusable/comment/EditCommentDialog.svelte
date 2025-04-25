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
	import type { ActionResult } from '@sveltejs/kit';
	import CommentInput from './CommentInput.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { UserPayload } from '$lib/trpc/services/user';
	import { handleOnError, handleOptimisticUpdate } from '$lib/utils/optimistic';

	type Props = {
		openEditComment: boolean;
		formEditComment: SuperValidated<Infer<ReturnType<typeof commentRequest>>>;
		text: string;
		postId: string;
		commentId: number;
		user: UserPayload;
	};

	let {
		openEditComment = $bindable(false),
		formEditComment,
		postId,
		commentId,
		text,
		user
	}: Props = $props();

	let formResult: ActionResult | null = $state(null);
	let mentionedUserIds: string[] = $state([]);

	let form = superForm(formEditComment, {
		validators: zodClient(commentRequest()),
		onSubmit: ({ formData }) => {
			formData.append('mentionUsers', mentionedUserIds.join(','));

			$commentMutate.mutate({
				text: formData.get('text') as string,
				mentionUsers: formData.get('mentionUsers') as string,
				postId,
				commentId
			});
		}
	});

	const { form: formData, enhance, reset } = form;

	let commentMutate = trpc($page).comment.editComment.createMutation({
		onMutate: async (newComment) => {
			openEditComment = false;

			await trpcClientUtils($page).comment.getPostComments.cancel();

			const previousComments = trpcClientUtils($page).comment.getPostComments.getInfiniteData({
				postId
			});

			// @ts-ignore (statusLoading cause type error)
			trpcClientUtils($page).comment.getPostComments.setInfiniteData({ postId }, (old) => {
				return handleOptimisticUpdate({
					previousData: old,
					operation: 'update',
					entityData: {
						id: newComment.commentId as number,
						...newComment
					},
					findIndex: (item) => item.id === newComment.commentId,
					customTransform: (item) => {
						return {
							...item,
							text: newComment.text,
						}
					}
				});
			});

			return { previousComments };
		},
		onError: (error, variables, context: unknown) => {
			handleOnError(context, (errCtx) => {
				trpcClientUtils($page).comment.getPostComments.setInfiniteData(
					{ postId },
					// @ts-ignore
					() => errCtx.previousResults
				);
			})

			formResult = {
				type: 'error',
				error: 'Cannot submit comment'
			};
		},
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(m.global_error_message());

				formResult = {
					type: 'error',
					error: 'Cannot submit comment'
				};
			}

			formResult = {
				type: 'success',
				status: 201
			};
		},
		onSettled: () => {
			trpcClientUtils($page).comment.getPostComments.invalidate();

			$formData.text = '';
			$formData.mentionUsers = '';

			$commentMutate.reset();
			reset();
		}
	});

	onMount(() => {
		$formData.text = text;

		// Don't do anything if there is mentioned users on the old text
	});
</script>

<ResponsiveDialog
	bind:open={openEditComment}
	title={m.edit_comment_dialog_title()}
	description={m.edit_comment_dialog_description()}
	drawerClose={m.edit_comment_drawer_close()}
>
	<form method="POST" use:enhance>
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

		<Button disabled={$commentMutate.isPending} type="submit" class="mt-4 w-full">
			{m.edit_comment_submit()}
		</Button>
	</form>
</ResponsiveDialog>

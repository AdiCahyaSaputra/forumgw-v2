<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { commentRequest } from '$lib/trpc/schema/commentSchema';
	import { trpcClientUtils } from '$lib/utils';
	import { SendHorizonal } from '@lucide/svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import CommentInput from './CommentInput.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { UserPayload } from '$lib/trpc/services/user';
	import { handleOnError, handleOptimisticUpdate } from '$lib/utils/optimistic';

	type Props = {
		formComment: SuperValidated<Infer<ReturnType<typeof commentRequest>>>;
		postId: string;
		user: UserPayload;
	};

	let { formComment, postId, user }: Props = $props();

	let formResult: ActionResult | null = $state(null);
	let mentionedUserIds: string[] = $state([]);

	let form = superForm(formComment, {
		validators: zodClient(commentRequest()),
		onSubmit: ({ formData }) => {
			formData.append('mentionUsers', mentionedUserIds.join(','));

			$commentMutate.mutate({
				postId,
				text: formData.get('text') as string,
				mentionUsers: formData.get('mentionUsers') as string
			});
		},
	});

	const { form: formData, enhance, reset } = form;

	let commentMutate = trpc($page).comment.createComment.createMutation({
		onMutate: async (newComment) => {
			await trpcClientUtils($page).comment.getPostComments.cancel();

			const previousComments = trpcClientUtils($page).comment.getPostComments.getInfiniteData({
				postId
			});

			// @ts-ignore (statusLoading cause type error)
			trpcClientUtils($page).comment.getPostComments.setInfiniteData({ postId }, (old) => {
				return handleOptimisticUpdate({
					previousData: old,
					operation: 'create',
					entityData: {
						id: null,
						...newComment
					},
					customTransform: (item) => {
						return {
							...item,
							text: newComment.text,
							user: {
								username: user.username,
								name: user.name,
								image: user.image
							},
							createdAt: new Date(),
							_count: {
								replies: 0
							},
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
					() => errCtx.previousComments
				);
			});

			formResult = {
				type: 'error',
				error: 'Cannot submit comment'
			};
		},
		onSuccess: (data) => {
			if(data.status!== 201) {
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
</script>

<div class="border-b p-4">
	<form method="POST" use:enhance class="flex items-start gap-2">
		<Form.Field {form} name="text" class="grow">
			<Form.Control>
				{#snippet children({ props })}
					<CommentInput
						bind:value={$formData.text}
						bind:mentionedUserIds
						formResultType={formResult?.type}
						defaultValue=""
						{...props}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Input name="postId" value={postId} class="hidden" />
		<Button size="icon" type="submit" disabled={$commentMutate.isPending}>
			<SendHorizonal />
		</Button>
	</form>
</div>

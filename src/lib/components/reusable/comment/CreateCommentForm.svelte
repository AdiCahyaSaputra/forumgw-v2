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
	import type { InfiniteData } from '@tanstack/svelte-query';

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
		onUpdate: async ({ result }) => {
			if (result.type !== 'success') {
				toast.error(result.data?.message || m.global_error_message());
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$inspect($formData.text);

	let commentMutate = trpc($page).comment.createComment.createMutation({
		onMutate: async (newComment) => {
			await trpcClientUtils($page).comment.getPostComments.cancel();

			const previousComments = trpcClientUtils($page).comment.getPostComments.getInfiniteData({
				postId
			});

			trpcClientUtils($page).comment.getPostComments.setInfiniteData({ postId }, (old) => {
				if (!old) return { pages: [], pageParams: [] };

				const newPages = [...old.pages];

				if (newPages.length > 0) {

					const randomNumber = Math.floor(Math.random() * 10) + Date.now();

					newPages[0].data.comments = [
						{
							id: randomNumber,
							text: newComment.text,
							postId: postId,
							_count: {
								replies: 0
							},
							user: {
								username: user.username,
								name: user.name,
								image: user.image
							},
							createdAt: new Date()
						},
						...newPages[0].data.comments
					];

				}

				return {
					...old,
					newPages
				};
			});

			return { previousComments };
		},
		onError: (error, variables, context: { previousComments: InfiniteData<any> | undefined }) => {
			if (context?.previousComments) {
				trpcClientUtils($page).comment.getPostComments.setInfiniteData(
					{ postId },
					() => context.previousComments!
				);
			}

			toast.error(m.global_error_message());

			formResult = {
				type: 'error',
				error: 'Cannot submit comment'
			};
		},
		onSuccess: () => {
			formResult = {
				type: 'success',
				status: 201
			};
		},
		onSettled: () => {
			trpcClientUtils($page).comment.getPostComments.invalidate();

			('Comment submitted');

			$formData.text = '';
			$formData.mentionUsers = '';

			$commentMutate.reset();
			reset();
		}
	});
</script>

<div class="border-b p-4">
	<form method="POST" use:enhance class="flex items-start gap-2" action="?/createComment">
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

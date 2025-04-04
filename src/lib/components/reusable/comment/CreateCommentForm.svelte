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

	type Props = {
		formComment: SuperValidated<Infer<ReturnType<typeof commentRequest>>>;
		postId: string;
	};

	let { formComment, postId }: Props = $props();

	let loadingComment = $state(false);
	let formResult: ActionResult | null = $state(null);
	let mentionedUserIds: string[] = $state([]);

	let form = superForm(formComment, {
		validators: zodClient(commentRequest()),
		onSubmit: ({ formData }) => {
			loadingComment = true;

			formData.append('mentionUsers', mentionedUserIds.join(','));
		},
		onResult: async ({ result }) => {
			formResult = result;
			loadingComment = false;

			trpcClientUtils($page).comment.getPostComments.invalidate();
			trpcClientUtils($page).post.getPostDetail.invalidate();

      // TODO: Trigger notification change using tRPC SSE (Server Send Event)
		},
		onUpdate: async ({ result }) => {
			if (result.type !== 'success') {
				toast.error(result.data?.message || m.global_error_message());
			}

			setTimeout(() => {
				formResult = null;
			}, 10);
		}
	});

	const { form: formData, enhance } = form;
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
		<Button size="icon" type="submit" disabled={loadingComment}>
			<SendHorizonal />
		</Button>
	</form>
</div>

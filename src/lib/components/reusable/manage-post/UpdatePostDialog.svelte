<script lang="ts">
	import { page } from '$app/stores';
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages.js';
	import { editPostRequest } from '$lib/trpc/schema/postSchema';
	import { trpcClientUtils } from '$lib/utils';
	import { VenetianMask, Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import TagInput from '../discussion/TagInput.svelte';
	import { trpc } from '$lib/trpc/client';

	type Props = {
		formEdit: SuperValidated<Infer<ReturnType<typeof editPostRequest>>>;
		groupId?: string;
		post: {
			id: string;
			content: string;
			createdAt: Date;
			user: {
				name: string;
				username: string;
				image: string | null;
			} | null;
			anonymous: {
				name: string;
				username: string;
			} | null;
			tags: string[];
			_count: {
				comment: number;
			};
		};
	};

	let { formEdit, groupId, post }: Props = $props();

	let open = $state(false);
	let tags = $state<string[]>([]);

	let postMutate = trpc($page).post.editPost.createMutation({
		onSuccess: (data) => {
			if (data.status !== 201) {
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
			reset();
		}
	});

	let form = superForm(formEdit, {
		validators: zodClient(editPostRequest()),
		onSubmit: ({ formData }) => {
			const data = Object.fromEntries(formData);

			$postMutate.mutate({
				tags,
				isAnonymous: data.isAnonymous === 'on',
				content: data.content as string,
				groupId,
        postId: post.id
			});
		}
	});

	const { form: formData, enhance, reset } = form;
</script>

<ResponsiveDialog
	bind:open
	title={m.post_form_edit_title()}
	description={m.post_form_edit_description()}
	drawerClose={m.post_form_edit_cancel()}
>
	<form method="POST" use:enhance>
		<Button
			variant={$formData.isAnonymous ? 'destructive' : 'outline'}
			class="justify-between items-center w-full"
			type="button"
			onclick={() => ($formData.isAnonymous = !$formData.isAnonymous)}
		>
			<span>
				{!$formData.isAnonymous ? m.post_form_is_not_anonymous() : m.post_form_is_anonymous()}
			</span>
			<VenetianMask />
		</Button>

		<Form.Field {form} name="content">
			<Form.Control>
				{#snippet children({ props })}
					<Textarea
						{...props}
						name="content"
						placeholder="Content"
						autocomplete="off"
						class="w-full mt-2"
						bind:value={$formData.content}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="isAnonymous">
			<Form.Control>
				{#snippet children({ props })}
					<Switch {...props} class="w-full mt-2 hidden" bind:checked={$formData.isAnonymous} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<TagInput bind:tags {groupId} />

		<Button disabled={$postMutate.isPending} type="submit" class="w-full mt-20">
			{m.post_form_edit_submit()}
		</Button>
	</form>
</ResponsiveDialog>

<Button onclick={() => {
  open = true;

  $formData.isAnonymous = post.anonymous !== null;
  $formData.content = post.content;

  tags = post.tags;
}}>
	<Pencil />
	Edit
</Button>

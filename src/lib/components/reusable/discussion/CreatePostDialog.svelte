<script lang="ts">
	import { page } from '$app/stores';
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages.js';
	import { createPostRequest } from '$lib/trpc/schema/postSchema';
	import { trpcClientUtils } from '$lib/utils';
	import { Plus, VenetianMask } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import TagInput from './TagInput.svelte';

	type Props = {
		formCreate: SuperValidated<Infer<ReturnType<typeof createPostRequest>>>;
	};

	let { formCreate }: Props = $props();

	let createPostLoading = $state(false);
	let open = $state(false);
	let tags = $state<string[]>([]);

	let form = superForm(formCreate, {
		validators: zodClient(createPostRequest()),
		onSubmit: ({ formData }) => {
			createPostLoading = true;

			formData.set('tags', tags.join(','));
		},
		onResult: async () => {
			createPostLoading = false;
		},
		onUpdate: async ({ result }) => {
			switch (result.type) {
				case 'failure':
					toast.error(result.data?.message || m.global_error_message());
					break;
				case 'success':
					trpcClientUtils($page).post.getPublicPostDiscussions.invalidate();
					trpcClientUtils($page).tag.getAllTags.invalidate();

					toast.success(result.data.message);

					open = false;
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
</script>

<ResponsiveDialog
	bind:open
	title={m.post_form_title()}
	description={m.post_form_message()}
	drawerClose={m.post_create_button_cancel()}
>
	<form method="POST" action="?/createNewPost" use:enhance>
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

		<TagInput bind:tags />

		<Button disabled={createPostLoading} type="submit" class="w-full mt-20">
			{m.post_create_button_submit()}
		</Button>
	</form>
</ResponsiveDialog>

<Button class="w-full" onclick={() => (open = true)}>
	<Plus />
	{m.post_button_new()}
</Button>

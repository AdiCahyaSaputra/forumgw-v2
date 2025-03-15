<script lang="ts">
	import { page } from '$app/stores';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
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

<Drawer.Root bind:open>
	<Drawer.Trigger class={buttonVariants({ variant: 'default', class: 'w-full' })}>
		<Plus />
		{m.post_button_new()}
	</Drawer.Trigger>
	<Drawer.Content class="flex justify-center items-center">
		<div class="w-80">
			<Drawer.Header class="text-center sm:text-center">
				<Drawer.Title>{m.post_form_title()}</Drawer.Title>
				<Drawer.Description>{m.post_form_message()}</Drawer.Description>
			</Drawer.Header>
			<form method="POST" action="?/createNewPost" class="px-4 pb-4" use:enhance>
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

				<Drawer.Footer class="p-0 pt-20">
					<Button disabled={createPostLoading} type="submit">
						{m.post_create_button_submit()}
					</Button>
					<Drawer.Close type="button" class="cursor-pointer">
						{m.post_create_button_cancel()}
					</Drawer.Close>
				</Drawer.Footer>
			</form>
		</div>
	</Drawer.Content>
</Drawer.Root>

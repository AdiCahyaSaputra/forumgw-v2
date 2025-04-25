<script lang="ts">
	import { createGroupRequest } from '$lib/trpc/schema/groupSchema';
	import { trpc } from '$lib/trpc/client';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus } from '@lucide/svelte';
	import ResponsiveDialog from '../global/ResponsiveDialog.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import InviteUserInput from './InviteUserInput.svelte';
	import { trpcClientUtils } from '$lib/utils';

	type Props = {
		formCreate: SuperValidated<Infer<ReturnType<typeof createGroupRequest>>>;
	};

	let { formCreate }: Props = $props();

	let open = $state(false);
	let invitedUsername = $state<string[]>([]);

	let groupMutate = trpc($page).group.createGroup.createMutation({
		onSuccess: (data) => {
			if (data.status !== 201) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			open = false;
			invitedUsername = [];

			trpcClientUtils($page).group.getAvailableGroups.invalidate();

			toast.success(data.message);
		},
		onError: (error) => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$groupMutate.reset();
			reset();
		}
	});

	let form = superForm(formCreate, {
		validators: zodClient(createGroupRequest()),
		onSubmit: ({ formData }) => {
			const data = Object.fromEntries(formData);

			$groupMutate.mutate({
				name: data.name as string,
				description: data.description as string,
				invitedUsername: invitedUsername
			});
		}
	});

	const { form: formData, enhance, reset } = form;
</script>

<ResponsiveDialog
	bind:open
	title={m.group_form_title()}
	description={m.group_form_message()}
	drawerClose={m.group_create_button_cancel()}
>
	<form method="POST" use:enhance>
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						name="name"
						placeholder="Name"
						autocomplete="off"
						class="w-full mt-2"
						bind:value={$formData.name}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						name="description"
						placeholder="Description"
						autocomplete="off"
						class="w-full mt-2"
						bind:value={$formData.description}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<InviteUserInput bind:usernames={invitedUsername} />

		<Button type="submit" disabled={$groupMutate.isPending} class="mt-20 w-full">
			{m.group_create_button_submit()}
		</Button>
	</form>
</ResponsiveDialog>

<Button onclick={() => (open = true)} class="lg:w-max w-full">
	<Plus />
	{m.button_create_group()}
</Button>

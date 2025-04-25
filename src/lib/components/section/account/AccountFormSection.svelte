<script lang="ts">
	import { editUserRequest } from '$lib/trpc/schema/userSchema';
	import type { UserPayload } from '$lib/trpc/services/user';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages.js';

	type EditUserRequest = ReturnType<typeof editUserRequest>;
	type UserForm = { name: string; username: string; bio: string | null; avatar: string | null };

	type Props = {
		formEdit: SuperValidated<Infer<EditUserRequest>>;
		user: UserPayload;
		onSubmit: (data: UserForm) => void;
		isPending: boolean;
	};

	let { formEdit, user, onSubmit, isPending }: Props = $props();

	let form = superForm(formEdit, {
		validators: zodClient(editUserRequest({ ...user, avatar: user.image })),
		onSubmit: ({ formData }) => {
			const data = Object.fromEntries(formData) as unknown as UserForm;

			data.avatar = user.image;

			onSubmit(data);
		},
		resetForm: false
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="mt-4 lg:w-1/2 w-full">
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					placeholder="Username"
					autocomplete="off"
					class="w-full mt-2"
					bind:value={$formData.username}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					placeholder="Name"
					autocomplete="off"
					class="w-full mt-2"
					bind:value={$formData.name}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="bio">
		<Form.Control>
			{#snippet children({ props })}
				<Textarea
					{...props}
					placeholder="Bio"
					autocomplete="off"
					class="w-full mt-2"
					bind:value={$formData.bio}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Button type="submit" class="mt-4" disabled={isPending}
		>{m.upload_profile_picture_form_submit()}</Button
	>
</form>

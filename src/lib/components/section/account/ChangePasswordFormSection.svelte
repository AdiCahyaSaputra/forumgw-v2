<script lang="ts">
	import { page } from '$app/stores';
	import ConfirmDialog from '$lib/components/reusable/global/ConfirmDialog.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { changePasswordRequest } from '$lib/trpc/schema/userSchema';
	import type { ChangePasswordInput } from '$lib/trpc/schema/userSchema';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	type Props = {
		formChangePassword: SuperValidated<ChangePasswordInput>;
	};

	let { formChangePassword }: Props = $props();
	let confirmOpen = $state(false);
	let pendingPassword = $state<ChangePasswordInput | null>(null);

	let passwordMutate = trpc($page).user.changePassword.createMutation({
		onSuccess: (response) => {
			if (response.status !== 200) {
				toast.error(response.message);
				return;
			}

			confirmOpen = false;
			$formData.oldPassword = '';
			$formData.newPassword = '';
			$formData.confirmNewPassword = '';
			toast.success(response.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			pendingPassword = null;
			$passwordMutate.reset();
		}
	});

	let form = superForm(formChangePassword, {
		validators: zodClient(changePasswordRequest),
		onSubmit: ({ cancel }) => {
			cancel();
			pendingPassword = {
				oldPassword: $formData.oldPassword,
				newPassword: $formData.newPassword,
				confirmNewPassword: $formData.confirmNewPassword
			};
			confirmOpen = true;
		}
	});

	const { form: formData, enhance } = form;

	function confirmPasswordChange() {
		if (pendingPassword) {
			$passwordMutate.mutate(pendingPassword);
		}
	}
</script>

<section class="mt-8 border-t pt-6">
	<h2 class="text-lg font-bold">{m.account_password_title()}</h2>
	<p class="mt-1 text-sm text-muted-foreground">{m.account_password_description()}</p>

	<form method="POST" use:enhance class="mt-4 w-full lg:w-1/2">
		<Form.Field {form} name="oldPassword">
			<Form.Label>{m.account_password_old()}</Form.Label>
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						type="password"
						autocomplete="current-password"
						class="w-full"
						bind:value={$formData.oldPassword}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="newPassword">
			<Form.Label>{m.account_password_new()}</Form.Label>
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						type="password"
						autocomplete="new-password"
						class="w-full"
						bind:value={$formData.newPassword}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="confirmNewPassword">
			<Form.Label>{m.account_password_confirm()}</Form.Label>
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						type="password"
						autocomplete="new-password"
						class="w-full"
						bind:value={$formData.confirmNewPassword}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Button type="submit" class="mt-4" disabled={$passwordMutate.isPending}>
			{m.account_password_submit()}
		</Button>
	</form>
</section>

<ConfirmDialog
	bind:open={confirmOpen}
	title={m.account_password_confirm_title()}
	description={m.account_password_confirm_description()}
	submit={m.account_password_confirm_submit()}
	cancel={m.account_password_cancel()}
	onCancel={() => (pendingPassword = null)}
	onSubmit={confirmPasswordChange}
	isPending={$passwordMutate.isPending}
/>

<script lang="ts">
	import UploadPpFormSection from '$lib/components/section/account/UploadPPFormSection.svelte';
	import AccountFormSection from '$lib/components/section/account/AccountFormSection.svelte';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	let open = $state(false);

	let userMutate = trpc($page).user.editUser.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			invalidate('app:currentUser');

			open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$userMutate.reset();
		}
	});
</script>

<svelte:head>
	<title>Account</title>
	<meta name="description" content="ForumGW Account: Change your account setting" />
</svelte:head>

<section class="p-4">
	{#if data.user}
		<UploadPpFormSection
			bind:open
			user={data.user}
			onClientUploadComplete={(imageUrl: string) => {
				$userMutate.mutate({ ...data.user, avatar: imageUrl });
			}}
		/>

		<h2 class="text-lg font-bold mt-4">User Info</h2>

		<AccountFormSection
			formEdit={data.formEdit}
			user={data.user}
			onSubmit={(data) => {
				$userMutate.mutate(data);
			}}
			isPending={$userMutate.isPending}
		/>
	{/if}
</section>

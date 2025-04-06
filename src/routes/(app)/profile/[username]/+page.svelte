<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import BackNavigation from '$lib/components/reusable/global/BackNavigation.svelte';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import PostSection from '$lib/components/section/profile/PostSection.svelte';
  import * as m from '$lib/paraglide/messages.js';

	let openPreviewImage = $state(false);

	let { data } = $props();

	let user = trpc($page).user.getUserProfile.createQuery({
		username: data.params.username
	});
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="ForumGW Profile: Stalk their profile" />
</svelte:head>

<BackNavigation title="Profile" url="/discussion" />

<div
	class={[
		'fixed inset-0 bg-black/60 z-20 items-center justify-center',
		openPreviewImage ? 'flex' : 'hidden'
	]}
>
	<div>
		<div
			class="w-[300px] h-[300px] bg-muted bg-cover bg-center border"
			style="background-image: url({$user.data?.data?.image})"
		></div>
		<Button class="mt-2" onclick={() => (openPreviewImage = false)}>Tutup</Button>
	</div>
</div>

<section class="p-4 pb-0">
	<div class="flex flex-col gap-4">
		<Avatar.Root
			class="cursor-pointer rounded-md w-[80px] h-[80px]"
			onclick={() => (openPreviewImage = true)}
		>
			<Avatar.Image src={$user.data?.data?.image} alt="Profile Image" />
			<Avatar.Fallback>{$user.data?.data?.username[0].toUpperCase()}</Avatar.Fallback>
		</Avatar.Root>
		<div>
			<LoadingState isLoading={$user.isPending}>
				{#snippet loadingFallback()}
					<div class="w-40 py-4 bg-secondary rounded-md"></div>
					<div class="w-20 mt-2 py-2 bg-secondary rounded-md"></div>
				{/snippet}

				{#if $user.data}
					<h4 class="text-lg font-bold">
						{$user.data.data?.name}
					</h4>
					<p class="text-red-600 font-bold">
						@{$user.data.data?.username}
					</p>
				{/if}
			</LoadingState>
		</div>
	</div>
	<div class="flex justify-end items-center gap-4">
		<div class="grow h-px bg-primary mt-[5px]"></div>
		<p class="font-bold">
			Bio <span class="text-red-600">Gw</span>
		</p>
	</div>
	<LoadingState isLoading={$user.isPending}>
		{#snippet loadingFallback()}
			<div class="w-24 mt-2 py-2 bg-secondary rounded-md"></div>
		{/snippet}

		<p class="text-foreground/60 w-[80%]">
			{$user.data?.data?.bio ?? 'No Bio'}
		</p>
	</LoadingState>

	<div class="flex gap-4 mt-4">
		<p class="font-bold">
			{m.profile_digital_footprints()} <span class="text-red-600">Gw</span>
		</p>
		<div class="translate-y-[50%] grow bg-transparent border-t border-t-primary"></div>
	</div>
</section>

{#if $user.data}
	<PostSection userId={$user.data.data?.id} />
{/if}

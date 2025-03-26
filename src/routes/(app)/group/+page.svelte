<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Search } from '@lucide/svelte';
	import CreateGroupDialog from '$lib/components/reusable/group/CreateGroupDialog.svelte';
	import type { PageProps } from './$types';

	let {
		data
	}: PageProps = $props();

	let groupsFilter = writable({ search: '' });
	let groupsSearch = $state('');

	const groups = trpc($page).group.getAllGroups.createInfiniteQuery(groupsFilter, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});

	const userGroups = trpc($page).group.getAvailableGroups.createInfiniteQuery(
		{},
		{
			getNextPageParam: (lastPage) => lastPage.data.nextCursor
		}
	);

	const handleSearch = () => {
		$groupsFilter.search = groupsSearch;
	};
</script>

<svelte:head>
	<title>Community Group</title>
	<meta name="description" content="ForumGW Dicussion: Find your community" />
</svelte:head>

<section class="p-4 border-b">
	<h1 class="font-bold text-lg">{m.title_user_groups()}</h1>

	<CreateGroupDialog formCreate={data.formCreate} />

	<div class="flex gap-4 mt-4">
		<LoadingState isLoading={$userGroups.isPending}>
			{#snippet loadingFallback()}
				<div class="w-full py-20 bg-secondary rounded-md"></div>
			{/snippet}

			{#if $userGroups.data}
				{#if $userGroups.data.pages.flatMap((page) => page.data.groups).length > 0}
					{#each $userGroups.data.pages.flatMap((page) => page.data.groups) as group, idx (idx)}
						<div>
							<h4>{group.name}</h4>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-foreground/60">{m.empty_user_groups()}</p>
				{/if}
			{/if}
		</LoadingState>
	</div>
</section>

<section class="p-4">
	<h1 class="font-bold text-lg">{m.title_groups()}</h1>

	<div class="mt-4 flex space-x-2">
		<Input class="w-full" placeholder={m.placeholder_groups_search()} bind:value={groupsSearch} />
		<Button size="icon" onclick={handleSearch}>
			<Search />
		</Button>
	</div>

	<div class="flex gap-4 mt-4">
		<LoadingState isLoading={$groups.isPending}>
			{#snippet loadingFallback()}
				<div class="w-full py-20 bg-secondary rounded-md"></div>
			{/snippet}

			{#if $groups.data}
				{#if $groups.data.pages.flatMap((page) => page.data.groups).length > 0}
					{#each $groups.data.pages.flatMap((page) => page.data.groups) as group, idx (idx)}
						<div>
							<h4>{group.name}</h4>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-foreground/60">{m.empty_groups()}</p>
				{/if}
			{/if}
		</LoadingState>
	</div>
</section>

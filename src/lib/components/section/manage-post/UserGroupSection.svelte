<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';

	let { onSelectedGroupId, selectedGroupId } = $props();

	let groups = trpc($page).group.getAvailableGroups.createInfiniteQuery(
		{},
		{
			getNextPageParam: (lastPage) => lastPage.data.nextCursor
		}
	);

	$effect(() => {
		if ($groups.data) {
			if ($groups.data.pages.length > 0) {
				onSelectedGroupId($groups.data.pages[0].data.groups[0].id);
			}
		}
	});
</script>

<div class="overflow-x-auto flex p-4 pr-50 no-scrollbar gap-1 border-t">
	<LoadingState isLoading={$groups.isPending}>
		{#snippet loadingFallback()}
			{#each [1, 2, 3] as _, idx (idx)}
				<Button variant="outline" size="sm">...</Button>
			{/each}
		{/snippet}

		{#if $groups.data}
			{#each $groups.data.pages.flatMap((page) => page.data.groups) as group, idx (idx)}
				<Button
					onclick={() => onSelectedGroupId(group.id)}
					variant={selectedGroupId === group.id ? 'default' : 'outline'}
					size="sm"
				>
					{group.name}
				</Button>
			{/each}
		{/if}
	</LoadingState>
</div>

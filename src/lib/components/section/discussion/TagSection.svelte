<script lang="ts">
	import { page } from '$app/stores';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import { Eraser, Search, X } from '@lucide/svelte';
	import TagFilter from '$lib/components/reusable/discussion/TagFilter.svelte';
	import type { SelectedTag } from '$lib/constant';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { writable } from 'svelte/store';

	type Props = {
		onTagSelected: (tag: SelectedTag) => void;
		clearFilter: () => void;
		selectedTags: SelectedTag[];
		onlyCurrentUser?: boolean;
		groupId?: string;
		userId?: string;
		className?: string;
	};

	let {
		onTagSelected: selectTag,
		selectedTags,
		clearFilter,
		groupId,
		className,
		onlyCurrentUser,
		userId
	}: Props = $props();

	let tagsQueryFilter = writable<{
		groupId?: string;
		userId?: string;
		onlyCurrentUser?: boolean;
	}>({
		groupId: undefined,
		userId,
		onlyCurrentUser: onlyCurrentUser || false
	});

	const tags = trpc($page).tag.getAllTags.createInfiniteQuery(tagsQueryFilter, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});

	let openFilter = $state(false);
	let triggerMoreTagsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);

	let tagItems = $derived.by(() => {
		if (!$tags.data) return [];

		return $tags.data.pages.flatMap((page) => page.data.tags);
	});

	$effect(() => {
		// Listen to props changes
		$tagsQueryFilter = {
			groupId,
			userId,
			onlyCurrentUser: onlyCurrentUser || false
		};
	});
</script>

<TagFilter bind:open={openFilter} {selectTag} {groupId} {userId} />

<div class={['border-b sticky top-0 z-10 bg-white', className]}>
	<div class="relative h-full p-8">
		<div class="absolute inset-0 overflow-x-auto flex p-4 pr-50 no-scrollbar gap-1">
			<LoadingState isLoading={$tags.isPending}>
				{#snippet loadingFallback()}
					{#each [1, 2, 3] as _, idx (idx)}
						<Button variant="outline" size="sm">...</Button>
					{/each}
				{/snippet}

				{#if $tags.data}
					{#each selectedTags as tag, idx (idx)}
						<Button
							onclick={() => {
								selectTag(tag);
							}}
							variant="default"
							size="sm"
						>
							<span class="text-red-600 font-bold">#</span>
							{tag.name}
							<span class="font-bold">{tag._count.post}</span>
							<X />
						</Button>
					{/each}
					{#each tagItems as tag, idx (idx)}
						{#if !selectedTags.find((selectedTag) => selectedTag.id === tag.id)}
							<Button
								onclick={() => {
									selectTag(tag);
								}}
								variant="outline"
								size="sm"
							>
								<span class="text-red-600 font-bold">#</span>
								{tag.name}
								<span class="font-bold">{tag._count.post}</span>
							</Button>
						{/if}
					{/each}
					{#if $tags.data.pages.at(-1)?.data.hasNextPage}
						<IntersectionObserver
							element={triggerMoreTagsElement}
							bind:intersecting={isIntersecting}
						>
							<Button variant="outline" size="sm">...</Button>
						</IntersectionObserver>
					{/if}
				{/if}
			</LoadingState>
		</div>
		<div class="absolute inset-y-0 right-0 bg-white p-4 flex gap-2">
			<Button variant="outline" size="icon" onclick={clearFilter}>
				<Eraser />
			</Button>
			<Button variant="default" size="icon" onclick={() => (openFilter = true)}>
				<Search />
			</Button>
		</div>
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import { Eraser, Search } from '@lucide/svelte';

  type Props = {
    onTagSelected: (tagId: number) => void; 
    tagIds: number[]; 
    clearFilter: () => void;
  }

	const tags = trpc($page).tag.getAllTags.createQuery({});

	let { onTagSelected: selectTag, tagIds, clearFilter }: Props = $props();
</script>

<div class="border-b sticky top-0 z-10 bg-white">
	<div class="relative h-full p-8">
		<div class="absolute inset-0 overflow-x-auto flex p-4 pr-50 no-scrollbar gap-1">
			<LoadingState isLoading={$tags.isPending}>
				{#snippet loadingFallback()}
					{#each [1, 2, 3] as _, idx (idx)}
						<Button variant="outline" size="sm">...</Button>
					{/each}
				{/snippet}

				{#if $tags.data}
					{#each $tags.data.data.tags as tag, idx (idx)}
						<Button
							onclick={() => {
								selectTag(tag.id);
							}}
							variant={tagIds.includes(tag.id) ? 'default' : 'outline'}
							size="sm"
						>
							<span class="text-red-600 font-bold">#</span> {tag.name}
							<span class="font-bold">{tag._count.post}</span>
						</Button>
					{/each}
				{/if}
			</LoadingState>
		</div>
		<div class="absolute inset-y-0 right-0 bg-white p-4 border-l flex gap-2">
			<Button variant="outline" size="icon" onclick={clearFilter}>
				<Eraser />
			</Button>
			<Button variant="default" size="icon">
				<Search />
			</Button>
		</div>
	</div>
</div>

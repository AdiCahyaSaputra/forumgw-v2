<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import { Search } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	type TagsResponse = {
		id: number;
		name: string;
		_count: {
			post: number;
		};
	};

	let tags: TagsResponse[] = $state([]);
	let cursor: number | null = $state(null);
	let loading = $state(false);
	let hasMoreTag = $state(true);

	async function loadMoreTag() {
		if (loading || !hasMoreTag) return;

		loading = true;

		const { data } = await trpc().tag.getAllTags.query({
			cursor
		});

		tags = [...tags, ...data.tags];
		cursor = data.nextCursor || null;
		hasMoreTag = data.nextCursor !== null;

		loading = false;
	}

  console.log("get tags");

  onMount(loadMoreTag);
</script>

<div class="border-b sticky top-0 z-10 bg-white">
	<div class="relative h-full p-8">
		<div class="absolute inset-0 overflow-x-auto flex p-4 pr-20 no-scrollbar gap-1">
			{#each tags as tag, idx (idx)}
				<Button variant="outline" size="sm">
					#{tag.name}
					<span class="font-bold">{tag._count.post}</span>
				</Button>
			{/each}
		</div>
		<div class="absolute inset-y-0 right-0 bg-white p-4 border-l">
			<Button variant="default" size="icon">
				<Search />
			</Button>
		</div>
	</div>
</div>

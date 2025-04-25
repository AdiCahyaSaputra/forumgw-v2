<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import TagItem from '$lib/components/reusable/discussion/TagItem.svelte';

	let { open = $bindable(false), selectTag, groupId, userId } = $props();

	let tagFilter = writable({ name: '', groupId, userId });
	let tags = trpc($page).tag.getAllTags.createQuery(tagFilter);

	let filteredTags = $derived.by(() => {
		const allTags = $tags.data?.data.tags;

		let data: typeof allTags = [];

		if (allTags) {
			data =
				$tagFilter.name === ''
					? allTags
					: allTags.filter((tag) => tag.name.toLowerCase().includes($tagFilter.name.toLowerCase()));
		}

		return data;
	});
</script>

<Command.Dialog bind:open shouldFilter={false}>
	<Command.Input
		placeholder="Filter Tags..."
		oninput={(e) => ($tagFilter.name = e.currentTarget.value)}
	/>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Suggestions">
			{#if filteredTags.length > 0}
				{#each filteredTags as tag, idx (idx)}
					<Command.Item
						value={tag.name}
						onSelect={() => {
							selectTag(tag);
							open = false;
						}}
						class="flex justify-between"
					>
						<TagItem {tag} />
					</Command.Item>
				{/each}
			{/if}
		</Command.Group>
	</Command.List>
</Command.Dialog>

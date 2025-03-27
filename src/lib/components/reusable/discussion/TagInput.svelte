<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { trpc } from '$lib/trpc/client';
	import { Tags, X } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { writable } from 'svelte/store';
	import TagItem from '$lib/components/reusable/discussion/TagItem.svelte';

	type Props = {
		tags: string[];
		groupId?: string;
	};

	let { tags = $bindable(), groupId }: Props = $props();

	let tagSearch = $state('');
	let tagSearchFilter = writable<{ name: string; groupId?: string }>({ name: '', groupId });
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const allTags = trpc($page).tag.getAllTags.createQuery(tagSearchFilter);

	const filteredTags = $derived.by(() => {
		const tags = $allTags.data?.data.tags;

		let data: typeof tags = [];

		if (tags) {
			data =
				tagSearch === ''
					? tags
					: tags.filter((tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase()));
		}

		return data;
	});

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	$effect(() => {
		console.log(tagSearch, ' Dari effect');

		const timeout = setTimeout(() => {
			const isExists = $allTags.data?.data.tags.find(
				(tag) => tag.name.toLowerCase() === tagSearch.toLowerCase()
			)?.name;

			if (!isExists) {
				$tagSearchFilter.name = tagSearch; // Only trigger refetch when current 10 tags is not match with tagSearch
			}
		}, 1000);

		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<div class="flex flex-col mt-4 gap-2 border-t-2 border-dashed border-primary pt-4">
	{#if tags.length > 0}
		<div class="max-w-80 flex flex-wrap gap-2">
			{#each tags as tagName, idx (idx)}
				<Button
					variant="outline"
					onclick={() => {
						const clonedTags = [...tags];
						const deletedTagIdx = tags.indexOf(tagName);

						clonedTags.splice(deletedTagIdx, 1);

						tags = clonedTags;
					}}
					size="sm"
				>
					<span>
						<span class="text-red-600 font-bold">#</span>
						{tagName}
					</span>
					<X />
				</Button>
			{/each}
		</div>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				<Button
					variant="default"
					class="w-full justify-between"
					{...props}
					role="combobox"
					aria-expanded={open}
				>
					Tags (Optional)
					<Tags />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[200px] p-0" align="start">
			<Command.Root
				onStateChange={(state) => {
					tagSearch = state.search;
				}}
				shouldFilter={false}
			>
				<Command.Input placeholder="Tag Name..." />
				<Command.List>
					<Command.Group>
						{#if filteredTags.length > 0}
							{#each filteredTags as tag, idx (idx)}
								<Command.Item
									value={tag.name}
									onSelect={() => {
										if (!tags.includes(tag.name)) {
											tags = [...tags, tag.name];
										}

										closeAndFocusTrigger();
									}}
									class="flex justify-between"
								>
									<TagItem {tag} />
								</Command.Item>
							{/each}
						{:else if tagSearch !== ''}
							<Command.Item
								value={tagSearch}
								onSelect={() => {
									if (!tags.includes(tagSearch)) {
										tags = [...tags, tagSearch];
									}

									closeAndFocusTrigger();
								}}
								class="flex justify-between"
							>
								<TagItem tag={{ id: -1, name: tagSearch, _count: { post: 0 } }} />
							</Command.Item>
						{/if}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>

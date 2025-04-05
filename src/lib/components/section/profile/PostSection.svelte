<script lang="ts">
	import type { getPublicPostDiscussionsRequest } from '$lib/trpc/schema/postSchema';
	import { writable } from 'svelte/store';
	import type { SelectedTag } from '$lib/constant';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { z } from 'zod';
	import TagSection from '../discussion/TagSection.svelte';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import IntersectionObserver from 'svelte-intersection-observer';

	type PostsInput = z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>;

	const { userId } = $props();

	const postsInput = writable<PostsInput>({
		tagIds: [],
    userId,
    onlyCurrentUser: false
	});

	let triggerMorePostsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);
	let selectedTags = $state<SelectedTag[]>([]);

	const posts = trpc($page).post.getPublicPostDiscussions.createInfiniteQuery(postsInput, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});

	$effect(() => {
		if (isIntersecting) {
			$posts.fetchNextPage();
		}
	});
</script>

<section class="h-[20000px]">
	<div class="relative">
		<TagSection
			onTagSelected={(tag: SelectedTag) => {
				const clonedTagIds = [...$postsInput.tagIds];
				const clonedSelectedTags = [...selectedTags];
				const existTagIdIdx = clonedTagIds.indexOf(tag.id);

				if (existTagIdIdx !== -1) {
					clonedTagIds.splice(existTagIdIdx, 1);
					clonedSelectedTags.splice(existTagIdIdx, 1);
				} else {
					clonedTagIds.push(tag.id);
					clonedSelectedTags.push(tag);
				}

				$postsInput.tagIds = clonedTagIds;

				selectedTags = clonedSelectedTags;
			}}
			clearFilter={() => {
				$postsInput.tagIds = [];
			}}
      {userId} 
			{selectedTags}
      className="border-b-0"
		/>

		<LoadingState isLoading={$posts.isPending}>
			{#snippet loadingFallback()}
				<div class="p-4">
					<div class="w-full py-20 bg-secondary rounded-md"></div>
				</div>
			{/snippet}

			{#if $posts.data}
				{#each $posts.data.pages.flatMap((page) => page.data.posts) as post, idx (idx)}
					<CardPost {post} />
				{/each}

				{#if $posts.data.pages.at(-1)?.data.hasNextPage}
					<IntersectionObserver
						element={triggerMorePostsElement}
						bind:intersecting={isIntersecting}
					>
						<div class="p-4" bind:this={triggerMorePostsElement}>
							<div class="w-full py-20 bg-secondary rounded-md"></div>
						</div>
					</IntersectionObserver>
				{/if}
			{/if}
		</LoadingState>
	</div>
</section>

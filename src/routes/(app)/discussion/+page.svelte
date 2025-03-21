<script lang="ts">
	import { page } from '$app/stores';
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import CreatePostDialog from '$lib/components/reusable/discussion/CreatePostDialog.svelte';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import TagSection from '$lib/components/section/discussion/TagSection.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { getPublicPostDiscussionsRequest } from '$lib/trpc/schema/postSchema';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { writable } from 'svelte/store';
	import { z } from 'zod';
	import type { PageProps } from './$types';
  import type { SelectedTag } from '$lib/constant';

	type PostsInput = z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>;

	let { data }: PageProps = $props();

	const postsInput = writable<PostsInput>({
		tagIds: []
	});

	let triggerMorePostsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);
  let selectedTags = $state<SelectedTag[]>([]);

	const posts = trpc($page).post.getPublicPostDiscussions.createInfiniteQuery(postsInput, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});

	$effect(() => {
		if(isIntersecting) {
			$posts.fetchNextPage();
		}
	});
</script>

<svelte:head>
	<title>Discussion</title>
	<meta name="description" content="ForumGW Dicussion: Explore and discuss numerous topics" />
</svelte:head>

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

		$postsInput = { tagIds: clonedTagIds };
    selectedTags = clonedSelectedTags;
	}}
	clearFilter={() => {
		$postsInput = { tagIds: [] };
	}}
  {selectedTags}
/>

<div class="lg:hidden block p-4 border-b">
	<CreatePostDialog formCreate={data.formCreate} />
</div>

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
			<IntersectionObserver element={triggerMorePostsElement} bind:intersecting={isIntersecting}>
				<div class="p-4" bind:this={triggerMorePostsElement}>
					<div class="w-full py-20 bg-secondary rounded-md"></div>
				</div>
			</IntersectionObserver>
		{/if}
	{/if}
</LoadingState>

<div class="fixed z-10 right-4 bottom-4 lg:flex hidden">
	<CreatePostDialog formCreate={data.formCreate} />
</div>

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
	import BackNavigation from '$lib/components/reusable/global/BackNavigation.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';

	type PostsInput = z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>;

	let { data }: PageProps = $props();

	const postsInput = writable<PostsInput>({
		tagIds: [],
		groupId: data.params.id
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

<svelte:head>
	<title>Community Discussion</title>
	<meta
		name="description"
		content="ForumGW Community Dicussion: Explore and discuss numerous topics"
	/>
</svelte:head>

<BackNavigation title={m.group_detail_back_button()} url="/group" className="border-b-0" />

<div class="p-4 border-t">
	<h3 class="font-bold text-lg">{data.groupMetadata.name}</h3>
	<p class="text-sm text-foreground/60">{data.groupMetadata.description}</p>

	<div class="mt-4">
		<h4 class="font-bold">Member List</h4>
		<div class="flex items-center gap-4">
			<div class="flex rtl:space-x-reverse mt-2">
				{#each data.groupMetadata.members as member, idx (idx)}
					<Avatar.Root
						class="border m-0 rounded-md"
						style={{
							transform: `translateX(${idx * -1}rem)`
						}}
					>
						<Avatar.Image src={member.image} alt={member.username} />
						<Avatar.Fallback class="bg-white">
							{member.username[0].toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
				{/each}
			</div>
			<Button variant="link" class="p-0 hover:underline gap-0">
				<span class="font-bold">{data.groupMetadata._count.members}</span>&nbsp;Members
			</Button>
		</div>
	</div>
</div>

<div class="relative h-[20000px]">
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

			$postsInput = { tagIds: clonedTagIds, groupId: data.params.id };
			selectedTags = clonedSelectedTags;
		}}
		clearFilter={() => {
			$postsInput = { tagIds: [], groupId: data.params.id };
		}}
		{selectedTags}
		groupId={data.params.id}
		className="border-t"
	/>

	<div class="lg:hidden block p-4 border-b">
		<CreatePostDialog formCreate={data.formCreate} groupId={data.params.id} />
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
		<CreatePostDialog formCreate={data.formCreate} groupId={data.params.id} />
	</div>
</div>

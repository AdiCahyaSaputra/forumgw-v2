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
	import UpdatePostDialog from '$lib/components/reusable/manage-post/UpdatePostDialog.svelte';
	import DeletePostDialog from '$lib/components/reusable/manage-post/DeletePostDialog.svelte';
	import UserGroupSection from './UserGroupSection.svelte';

	type PostsInput = z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>;

	const { formEdit } = $props();

	const postsInput = writable<PostsInput>({
		tagIds: [],
		onlyCurrentUser: true,
		groupId: undefined
	});

	let triggerMorePostsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);
	let selectedTags = $state<SelectedTag[]>([]);
	let selectedGroupId = writable<string | undefined>(undefined);

	const posts = trpc($page).post.getPublicPostDiscussions.createInfiniteQuery(postsInput, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});

	$effect(() => {
		if (isIntersecting) {
			$posts.fetchNextPage();
		}
	});
</script>

<section>
	<div class="relative">
		<UserGroupSection
			onSelectedGroupId={(groupId: string) => {
				$selectedGroupId = groupId;
				$postsInput.groupId = groupId;
			}}
			selectedGroupId={$selectedGroupId}
		/>

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
			{selectedTags}
			className="border-t"
			onlyCurrentUser
			groupId={$selectedGroupId}
		/>

		<LoadingState isLoading={$posts.isPending}>
			{#snippet loadingFallback()}
				<div class="p-4">
					<div class="w-full py-20 bg-secondary rounded-md"></div>
				</div>
			{/snippet}

			{#if $posts.data}
				{#each $posts.data.pages.flatMap((page) => page.data.posts) as post, idx (idx)}
					<CardPost {post}>
						{#snippet extraActions()}
							<div class="flex justify-end grow gap-1">
								<UpdatePostDialog {formEdit} {post} groupId={$selectedGroupId} />
								<DeletePostDialog postId={post.id} groupId={$selectedGroupId} />
							</div>
						{/snippet}
					</CardPost>
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

<script lang="ts">
	import { page } from '$app/stores';
	import CardComment from '$lib/components/reusable/comment/CardComment.svelte';
	import CreateCommentForm from '$lib/components/reusable/comment/CreateCommentForm.svelte';
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import BackNavigation from '$lib/components/reusable/global/BackNavigation.svelte';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { writable } from 'svelte/store';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const commentsFilter = writable({
		postId: data.params.id
	});

	let triggerMoreCommentsElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);

	const post = trpc($page).post.getPostDetail.createQuery({ id: data.params.id });
	const comments = trpc($page).comment.getPostComments.createInfiniteQuery(commentsFilter, {
		getNextPageParam: (lastPage) => lastPage.data.nextCursor
	});
</script>

<svelte:head>
	<title>Discussion</title>
	<meta name="description" content="ForumGW Dicussion: Discussion details" />
</svelte:head>

<BackNavigation title={m.post_detail_page_title()} url="/discussion" />

<LoadingState isLoading={$post.isPending}>
	{#snippet loadingFallback()}
		<div class="p-4">
			<div class="w-full py-20 bg-secondary rounded-md"></div>
		</div>
	{/snippet}

	{#if $post.data}
		<CardPost post={$post.data.data.post} />
		<CreateCommentForm formComment={data.formComment} postId={$post.data.data.post.id} />
	{/if}
</LoadingState>

<LoadingState isLoading={$comments.isLoading}>
	{#snippet loadingFallback()}
		<div class="p-4">
			<div class="w-full py-8 bg-secondary rounded-md"></div>
		</div>
	{/snippet}

	{#if $comments.data}
		<div class="p-4 flex flex-col space-y-4">
			{#each $comments.data.pages.flatMap((page) => page.data.comments) as comment (comment.id)}
				<CardComment {comment} formReplyComment={data.formReplyComment} />
			{/each}

			{#if $comments.data.pages.at(-1)?.data.hasNextPage}
				<IntersectionObserver
					element={triggerMoreCommentsElement}
					bind:intersecting={isIntersecting}
				>
					<div class="p-4" bind:this={triggerMoreCommentsElement}>
						<div class="w-full py-8 bg-secondary rounded-md"></div>
					</div>
				</IntersectionObserver>
			{/if}
		</div>
	{/if}
</LoadingState>

<script lang="ts">
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import type { PageProps } from './$types';
	import TagSection from '$lib/components/section/discussion/TagSection.svelte';
	import CreatePostDialog from '$lib/components/reusable/discussion/CreatePostDialog.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Discussion</title>
	<meta name="description" content="ForumGW Dicussion: Explore and discuss numerous topics" />
</svelte:head>

<TagSection />

<div class="lg:hidden block p-4 border-b">
	<CreatePostDialog />
</div>

{#each data.publicPostDiscussions.data as post, idx (idx)}
	<CardPost {post} />
{/each}

<div class="fixed z-10 right-4 bottom-4 lg:flex hidden">
	<CreatePostDialog />
</div>

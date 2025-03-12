<script lang="ts">
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Discussion</title>
	<meta name="description" content="ForumGW Dicussion: Explore and discuss numerous topics" />
</svelte:head>

{#each data.publicPostDiscussions.data as post, idx (idx)}
	<CardPost {post} />
{/each}

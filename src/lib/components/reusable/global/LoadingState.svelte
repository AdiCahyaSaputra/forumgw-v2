<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		isLoading: boolean;
		loadingFallback: Snippet;
		children: Snippet;
	};

	const { isLoading, loadingFallback, children } = $props();
</script>

{#if isLoading}
	{@render loadingFallback()}
{:else}
	{@render children()}
{/if}

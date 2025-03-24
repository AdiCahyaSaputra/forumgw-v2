<script lang="ts">
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import IntersectionObserver from 'svelte-intersection-observer';

	let { data, loadingChild, child, intersectionChild } = $props();

	let triggerElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);
</script>

<LoadingState isLoading={$data.isPending}>
	{#snippet loadingFallback()}
		{@render loadingChild()}
	{/snippet}

	{#if $data.data}
    {@render child()}

		{#if $data.data.pages.at(-1)?.data.hasNextPage}
			<IntersectionObserver element={triggerElement} bind:intersecting={isIntersecting}>
        <div bind:this={triggerElement}>
          {@render intersectionChild()}
        </div>
			</IntersectionObserver>
		{/if}
	{/if}
</LoadingState>

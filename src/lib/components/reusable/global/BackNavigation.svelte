<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeft } from '@lucide/svelte';

	let previousPage: string = $state(base);

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	const { title, url = null, className = '' } = $props();
</script>

<div class={["sticky top-0 z-10 border-b bg-white p-4 flex items-center gap-2", className]}>
	<Button
		size="icon"
		variant="outline"
		onclick={() => goto(url ?? previousPage)}
	>
		<ChevronLeft />
	</Button>
	<p class="text-lg font-bold">{title}</p>
</div>

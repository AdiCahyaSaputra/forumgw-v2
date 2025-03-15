<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<ParaglideJS {i18n}>
	<QueryClientProvider client={data.queryClient}>
		<Toaster richColors position="top-right" />
		<div class="selection:bg-black selection:text-white">
			{@render children()}
		</div>
	</QueryClientProvider>
</ParaglideJS>

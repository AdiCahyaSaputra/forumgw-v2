<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index';

	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	<Toaster richColors position="top-right" />
	<div class="selection:bg-black selection:text-white">
		{@render children()}
	</div>
</ParaglideJS>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { i18n } from '$lib/i18n';
	import { languageTag, type AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { Languages } from '@lucide/svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	const switchToLanguage = (lang: AvailableLanguageTag) => {
		const canonicalPath = i18n.route(page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, lang);

		goto(localisedPath);
	};
</script>

<Button
	onclick={() => {
		const currentLang = languageTag();

		switchToLanguage(currentLang === 'en' ? 'id' : 'en');
	}}
	variant="outline"
	class="uppercase font-semibold"
>
	<Languages />
	{languageTag()}
</Button>

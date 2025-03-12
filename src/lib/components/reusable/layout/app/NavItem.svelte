<script lang="ts">
	import { type Icon as IconType } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { i18n } from '$lib/i18n';

	type Props = {
		url: string;
		label: string;
		icon: typeof IconType;
	};

	const { url, label, icon }: Props = $props();
</script>

<li class="cursor-pointer">
	<a href={url} class="cursor-pointer">
		<Button
			variant={i18n.route(page.url.pathname).startsWith(url) ? 'default' : 'ghost'}
			class={`flex items-center border justify-start space-x-2 w-full ${!i18n.route(page.url.pathname).startsWith(url) && 'bg-white'}`}
		>
			{@const Icon = icon}
			<Icon class="w-5 h-5 stroke-[2.5]" />
			<span>{label}</span>
		</Button>
	</a>
</li>

<script lang="ts">
	import { type Icon as IconType } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';

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
			variant={page.url.pathname.startsWith(url) ? 'default' : 'ghost'}
			class={`flex items-center border justify-start space-x-2 w-full ${!page.url.pathname.startsWith(url) && 'bg-white'}`}
		>
			{@const Icon = icon}
			<Icon class="w-5 h-5 stroke-[2.5]" />
			<span>{label}</span>
		</Button>
	</a>
</li>

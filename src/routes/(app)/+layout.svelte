<script lang="ts">
	import Navbar from '$lib/components/reusable/layout/app/Navbar.svelte';
	import AppAside from '$lib/components/section/global/AppAside.svelte';
	import type { UserPayload } from '$lib/trpc/services/user.js';
	import type { Snippet } from 'svelte';

	type Props = {
		data: {
			user: UserPayload | null;
		};
		children: Snippet;
	};

	let { data, children }: Props = $props();
</script>

<Navbar user={data.user} />
<div class="flex items-start relative">
	<AppAside user={data.user} />
	<main class="grow min-h-screen relative pb-40">
		{@render children()}
	</main>
</div>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionResult } from '@sveltejs/kit';

	let logoutLoading = $state(false);
	let formResult: ActionResult | null = $state(null);
</script>

<svelte:head>
	<title>Discussion</title>
	<meta name="description" content="ForumGW Dicussion: Explore and discuss numerous topics" />
</svelte:head>

<h1>Discussion</h1>
<form
	method="POST"
	action="?/logout"
	use:enhance={() => {
		logoutLoading = true;

		return async ({ result }) => {
			logoutLoading = false;
			formResult = result;

			switch (result.type) {
				case 'failure':
					toast.error((result.data?.message as string | undefined) || m.global_error_message());
					break;
				case 'success':
					await goto('/login', { replaceState: true });
					break;
				default:
					toast.error(m.global_error_message());
			}
		};
	}}
>
	<Button disabled={logoutLoading || formResult?.type === 'success'} type="submit">Logout</Button>
</form>

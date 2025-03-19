<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Siren } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { posts } from '$lib/server/db/schema';
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';

	const { id }: { id: (typeof posts.$inferSelect)['id'] } = $props();

	let open = $state(false);
</script>

<ResponsiveDialog
	bind:open
	title={m.post_report_title()}
	description={m.post_report_message()}
	drawerClose={m.post_report_button_cancel()}
>
	<form
		method="POST"
		action="?/reportPost"
		use:enhance={() =>
			async ({ result }) => {
				switch (result.type) {
					case 'failure':
						toast.error(result.data?.message || m.global_error_message());
						break;
					case 'success':
						toast.success(result.data?.message || 'ok');
						break;
					default:
						toast.error(m.global_error_message());
				}
			}}
	>
		<input type="text" class="hidden" name="id" value={id} />
		<Input
			name="reason"
			type="text"
			placeholder="Reason (Optional)"
			autocomplete="off"
			class="w-full"
		/>

		<Button type="submit" class="mt-4 w-full">{m.post_report_button_submit()}</Button>
	</form>
</ResponsiveDialog>

<Button variant="destructive" onclick={() => open = true}>
	<Siren />
</Button>

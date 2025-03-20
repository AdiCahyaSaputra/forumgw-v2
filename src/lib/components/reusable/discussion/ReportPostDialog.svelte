<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Siren } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { posts } from '$lib/server/db/schema';
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';

	const { id }: { id: (typeof posts.$inferSelect)['id'] } = $props();

	let open = $state(false);

	let reportPost = trpc($page).post.reportPost.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

      open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		}
	});
</script>

<ResponsiveDialog
	bind:open
	title={m.post_report_title()}
	description={m.post_report_message()}
	drawerClose={m.post_report_button_cancel()}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();

			$reportPost.mutate({ id, reason: e.currentTarget.reason.value });
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

		<Button type="submit" disabled={$reportPost.isPending} class="mt-4 w-full">{m.post_report_button_submit()}</Button>
	</form>
</ResponsiveDialog>

<Button variant="destructive" onclick={() => (open = true)}>
	<Siren />
</Button>

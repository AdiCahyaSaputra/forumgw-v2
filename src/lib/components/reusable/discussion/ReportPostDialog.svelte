<script lang="ts">
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Siren } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { posts } from '$lib/server/db/schema';

	const { id }: { id: (typeof posts.$inferSelect)['id'] } = $props();
</script>

<Drawer.Root>
	<Drawer.Trigger class={buttonVariants({ variant: 'destructive' })}>
		<Siren />
	</Drawer.Trigger>
	<Drawer.Content class="flex justify-center items-center">
		<div class="w-max">
			<Drawer.Header class="text-center sm:text-center">
				<Drawer.Title>{m.post_report_title()}</Drawer.Title>
				<Drawer.Description>{m.post_report_message()}</Drawer.Description>
			</Drawer.Header>
			<form
				method="POST"
				action="?/reportPost"
				class="px-4 pb-4"
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

				<Drawer.Footer class="p-0 pt-4">
					<Button type="submit">{m.post_report_button_submit()}</Button>
					<Drawer.Close type="button" class="cursor-pointer"
						>{m.post_report_button_cancel()}</Drawer.Close
					>
				</Drawer.Footer>
			</form>
		</div>
	</Drawer.Content>
</Drawer.Root>

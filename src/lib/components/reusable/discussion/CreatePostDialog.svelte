<script lang="ts">
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Plus, VenetianMask } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Textarea } from '$lib/components/ui/textarea';

	let isAnonymous = $state(false);
</script>

<Drawer.Root>
	<Drawer.Trigger class={buttonVariants({ variant: 'default', class: 'w-full' })}>
		<Plus />
		{m.post_button_new()}
	</Drawer.Trigger>
	<Drawer.Content class="flex justify-center items-center">
		<div class="w-max">
			<Drawer.Header class="text-center sm:text-center">
				<Drawer.Title>{m.post_form_title()}</Drawer.Title>
				<Drawer.Description>{m.post_form_message()}</Drawer.Description>
			</Drawer.Header>
			<form
				method="POST"
				action="?/createNewPost"
				class="px-4 pb-4"
				use:enhance={() =>
					async ({ result }) => {
						// switch (result.type) {
						// 	case 'failure':
						// 		toast.error(result.data?.message || m.global_error_message());
						// 		break;
						// 	case 'success':
						// 		toast.success(result.data?.message || 'ok');
						// 		break;
						// 	default:
						// 		toast.error(m.global_error_message());
						// }
					}}
			>
				<Button
					variant={isAnonymous ? 'destructive' : 'outline'}
					class="justify-between items-center w-full"
					type="button"
          onclick={() => isAnonymous = !isAnonymous}
				>
					<span>{!isAnonymous ? m.post_form_is_not_anonymous() : m.post_form_is_anonymous()}</span>
					<VenetianMask />
				</Button>

				<Textarea
					name="content"
					placeholder="Content"
					autocomplete="off"
					class="w-full mt-2"
					required
				/>

				<Drawer.Footer class="p-0 pt-4">
					<Button type="submit">Submit</Button>
					<Drawer.Close>Cancel</Drawer.Close>
				</Drawer.Footer>
			</form>
		</div>
	</Drawer.Content>
</Drawer.Root>

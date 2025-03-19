<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	type Props = {
		open: boolean;
		title: string;
		description?: string;
		cancel: string;
		submit: string;
		onSubmit: () => void;
		isPending: boolean;
	};

	let { open = $bindable(false), title, description, cancel, submit, onSubmit, isPending }: Props = $props();
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>{description}</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{cancel}</AlertDialog.Cancel>
			<AlertDialog.Action disabled={isPending} onclick={onSubmit}>{submit}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

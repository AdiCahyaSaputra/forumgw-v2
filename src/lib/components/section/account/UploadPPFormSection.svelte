<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import ResponsiveDialog from '$lib/components/reusable/global/ResponsiveDialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createUploadThing } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { Plus } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { invalidate } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	let { user, onClientUploadComplete, open = $bindable() } = $props();

	let filePreview = $state('');
	let file = $state<File | null>(null);
	let beginUpload = $state(false);

	let userMutate = trpc($page).user.editUser.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			invalidate('app:currentUser');

			open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$userMutate.reset();
		}
	});

	const { startUpload } = createUploadThing('imageUploader', {
		onClientUploadComplete: (res) => {
			console.log(res);

			toast.success('Image uploaded successfully');

			beginUpload = false;

      onClientUploadComplete(res[0].ufsUrl);
		}
	});

	const fileChangeHandler = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		const files = target.files;

		if (files && files.length > 0) {
			if (files[0].size > 1024 * 3000) {
				return alert('Image size must be less than 3MB');
			}

			file = files[0];
			filePreview = URL.createObjectURL(files[0]);
		}
	};

	const fileUploadHandler = async () => {
		if (!file) return;

		beginUpload = true;

		await startUpload([file]);
	};
</script>

<ResponsiveDialog
	bind:open
	title={m.upload_profile_picture_title()}
	description={m.upload_profile_picture_description()}
	drawerClose="Cancel"
>
	<div
		class="w-full aspect-square bg-muted relative bg-cover bg-center group overflow-hidden"
		style="background-image: url({filePreview});"
	>
		{#if filePreview}
			<div
				class="absolute inset-0 bg-black/80 hidden transition-all items-center group-hover:flex justify-center"
			>
				<Button
					variant="destructive"
					onclick={() => {
						file = null;
						filePreview = '';
					}}
					disabled={beginUpload}
				>
          {m.upload_profile_picture_delete()}
				</Button>
			</div>
		{/if}

		<label
			for="pp"
			class={[
				'absolute inset-0 flex items-center justify-center cursor-pointer',
				filePreview && 'hidden'
			]}
		>
			<Plus />
		</label>
		<input
			type="file"
			accept="image/*"
			id="pp"
			multiple={false}
			class="hidden"
			onchange={fileChangeHandler}
		/>
	</div>

	<Button class="w-full mt-4 lg:mt-0" disabled={!file || beginUpload} onclick={fileUploadHandler}>Upload</Button>
</ResponsiveDialog>

<div class="flex items-start gap-4">
	<Avatar.Root class="rounded-md border m-0 cursor-pointer w-20 h-20" onclick={() => (open = true)}>
		<Avatar.Image src={user.image} alt="@shadcn" />
		<Avatar.Fallback class="bg-white">{user.username[0].toUpperCase()}</Avatar.Fallback>
	</Avatar.Root>
	<div>
		<h3 class="text-lg font-bold">{m.upload_profile_picture_form_title()}</h3>
		<p class="text-sm text-foreground/60">{m.upload_profile_picture_form_description()}</p>
	</div>
</div>

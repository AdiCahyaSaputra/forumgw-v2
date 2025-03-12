<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import type { UserPayload } from '$lib/trpc/services/user.js';
	import LangSwitcher from '$lib/components/reusable/global/LangSwitcher.svelte';

	const { user }: { user: UserPayload | null } = $props();
</script>

<nav class="py-4 border-b">
	<div class="lg:px-[2rem] px-4 flex justify-between items-center">
		<a href="/discussion" class="font-bold text-xl">
			Forum<span class="text-red-600">Gw</span>
		</a>

		<div class="flex gap-4">
			<LangSwitcher />
			<a href={`/profil/${user?.username}`}>
				<Avatar.Root class="cursor-pointer rounded-md">
					<Avatar.Image src={user?.image} alt="Profile Image" />
					<Avatar.Fallback>{user?.username[0].toUpperCase()}</Avatar.Fallback>
				</Avatar.Root>
			</a>
		</div>
	</div>
</nav>

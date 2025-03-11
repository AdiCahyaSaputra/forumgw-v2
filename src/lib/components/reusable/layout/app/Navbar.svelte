<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
</script>

<nav class="py-4 border-b">
	<div class="lg:px-[2rem] px-4 flex justify-between items-center">
		<a href="/discussion" class="font-bold text-xl">
			Forum<span class="text-red-600">Gw</span>
		</a>

		<a href={`/profil/`}>
			<Avatar.Root class="cursor-pointer rounded-md">
				<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
				<Avatar.Fallback>CN</Avatar.Fallback>
			</Avatar.Root>
		</a>
	</div>
</nav>

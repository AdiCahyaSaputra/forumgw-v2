<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	const links = [
		{
			title: 'Figma',
			url: 'https://www.figma.com/community/file/1490962127835734938/forumgw',
			icon: '🐦'
		},
		{
			title: 'GitHub',
			url: 'https://github.com/AdiCahyaSaputra/forumgw-v2',
			icon: '💻'
		},
		{
			title: 'Creator',
			url: 'https://adics.xyz',
			icon: '😅'
		},
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 flex justify-center items-center">
	<div class="max-w-2xl mx-auto">
		<!-- Profile Section -->
		<div class="text-center mb-12">
			<h1 class="text-3xl font-bold text-foreground mb-2">Forum<span class="text-red-600">GW</span></h1>
		</div>

		<!-- Links Grid -->
		<div class="space-y-4">
			{#each links as link}
				<a
					href={link.url}
					class="block bg-primary hover:bg-primary/80 rounded-lg p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
				>
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <span class="text-2xl">{link.icon}</span>
              <span class="text-primary-foreground text-lg font-medium">{link.title}</span>
            </div>
            <ArrowRight class="stroke-primary-foreground" />
          </div>
				</a>
			{/each}
		</div>

		<!-- Footer -->
		<div class="mt-12 text-center text-foreground">
			<p>Made with ❤️ using SvelteKit, Thanks TraeAI</p>
		</div>
	</div>
</div>

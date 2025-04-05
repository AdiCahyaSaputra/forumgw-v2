<script lang="ts">
	let goBackClicked = $state(false);
</script>

<section class="h-screen flex flex-col justify-center items-center">
	<div class="space-y-2">
		<h1 class="text-lg font-bold">I&apos;m working on it</h1>
		{#if goBackClicked}
			<p class="cursor-pointer">
        There is no going back <br/> until i&apos;m done with my work :)
      </p>
		{:else}
			<button onclick={() => (goBackClicked = true)} class="cursor-pointer">Go back</button>
		{/if}
	</div>
</section>

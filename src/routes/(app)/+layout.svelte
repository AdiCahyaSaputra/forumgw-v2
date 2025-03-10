<script lang="ts">
	let { children } = $props();
</script>

<aside>
	<nav>
		<ul>
			<li>
				<a href="/discussion">Discussion</a>
			</li>
		</ul>
	</nav>
</aside>
<main>
	{@render children()}
</main>

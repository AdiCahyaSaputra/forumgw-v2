<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import '../app.css';

	let { children } = $props();
</script>

<ParaglideJS {i18n}>
  <div class="selection:bg-black selection:text-white">
    {@render children()}
  </div>
</ParaglideJS>

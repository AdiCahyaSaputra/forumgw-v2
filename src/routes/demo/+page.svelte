<script lang="ts">
  import { BadWordFilter } from '$lib/utils';

  let unfilteredText = $state('');
  let filteredText = $derived.by(() => {
    return BadWordFilter(unfilteredText);
  });
</script>

<div>
  <input bind:value={unfilteredText} />
  <p>- {filteredText}</p>
</div>
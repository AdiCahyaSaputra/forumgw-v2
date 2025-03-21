<script lang="ts">
	type Props = {
		tag: {
			id: number;
			name: string;
			_count: {
				post: number;
			};
		};
	};

	let { tag } = $props();
</script>

<span><span class="text-red-600 font-bold">#</span> {tag.name}</span>
<span class="font-bold">{tag._count.post}</span>

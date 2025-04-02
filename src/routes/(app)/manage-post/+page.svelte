<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { Rss, Users } from '@lucide/svelte';
	import DiscussionSection from '$lib/components/section/manage-post/DiscussionSection.svelte';
	import GroupSection from '$lib/components/section/manage-post/GroupSection.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Manage Post</title>
	<meta name="description" content="ForumGW Manage Post: Manage your posts" />
</svelte:head>

<Tabs.Root value="discussion">
	<div class="p-4 w-full">
		<Tabs.List>
			<Tabs.Trigger value="discussion" class="gap-2">
				<Rss class="w-4 aspect-square" />
				<span>{m.nav_item_discussion()}</span>
			</Tabs.Trigger>
			<Tabs.Trigger value="group" class="gap-2">
				<Users class="w-4 aspect-square" />
				<span>{m.nav_item_group()}</span>
			</Tabs.Trigger>
		</Tabs.List>
	</div>
	<Tabs.Content value="discussion">
		<DiscussionSection formEdit={data.formEdit} />
	</Tabs.Content>
	<Tabs.Content value="group">
		<GroupSection formEdit={data.formEdit} />
	</Tabs.Content>
</Tabs.Root>

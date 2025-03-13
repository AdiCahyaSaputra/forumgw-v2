<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { MessageSquare } from '@lucide/svelte';
	import ReportPostDialog from './ReportPostDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		post: {
			id: string;
			content: string;
			cretedAt: Date;
			user: {
				name: string;
				username: string;
				image: string | null;
			} | null;
			anonymous: {
				name: string;
				username: string;
			} | null;
			tags: string[];
			_count: {
				comment: number;
			};
		};
	};

	const { post }: Props = $props();
</script>

<div class="border-b">
	<div class="flex items-start gap-2 p-4 pb-2">
		<Avatar.Root class="rounded-md border m-0">
			<Avatar.Image src="" alt="@shadcn" />
			<Avatar.Fallback class="bg-white">A</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex items-start grow justify-between">
			<div>
				{#if post.user}
					<h3 class="text-sm leading-none font-bold">{post.user.name}</h3>
					<a href={`/profil/${post.user.username}`} class="text-xs hover:underline">
						{post.user.username}
					</a>
				{:else if post.anonymous}
					<h3 class="text-sm leading-none font-bold">{post.anonymous.name}</h3>
					<p class="text-xs hover:underline">{post.anonymous.username}</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="px-4 pb-4">
		<small class="text-foreground/60">{m.post_created_at()} 2 hari yang lalu</small>
		<div class="py-2 flex gap-1">
			{#each post.tags as tagName, idx (idx)}
				<Badge variant="outline" class="cursor-pointer hover:bg-slate-100">#{tagName}</Badge>
			{/each}
		</div>
		<p class="cst-wrap-text">{post.content}</p>
	</div>

	<div class="px-4 pb-4">
		<Button variant="outline">
			<MessageSquare />
			<span>{post._count.comment}</span>
		</Button>
		<ReportPostDialog id={post.id} />
	</div>
</div>

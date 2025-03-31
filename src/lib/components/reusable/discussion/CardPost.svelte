<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { timeAgo } from '$lib/utils';
	import { MessageSquare } from '@lucide/svelte';
	import ReportPostDialog from './ReportPostDialog.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		post: {
			id: string;
			content: string;
			createdAt: Date;
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
    extraActions?: Snippet
	};

	const { post, extraActions }: Props = $props();
</script>

<div class="border-b">
	<div class="flex items-start gap-2 p-4 pb-2">
		<Avatar.Root class="rounded-md border m-0">
			<Avatar.Image src={post.user?.image} alt="@shadcn" />
			<Avatar.Fallback class="bg-white">
				{#if post.user}
					{post.user?.username[0].toUpperCase()}
				{:else}
					A
				{/if}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex items-start grow justify-between">
			<div>
				{#if post.user}
					<h3 class="text-sm leading-none font-bold">{post.user.name}</h3>
					<a href={`/profile/${post.user.username}`} class="text-sm hover:underline">
						{post.user.username}
					</a>
				{:else if post.anonymous}
					<h3 class="text-sm leading-none font-bold">{post.anonymous.name}</h3>
					<p class="text-sm">{post.anonymous.username}</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="px-4 pb-4">
		<small class="text-foreground/60">{m.post_created_at()} {timeAgo(post.createdAt)}</small>
		{#if post.tags.length > 0}
			<div class="py-2 flex gap-1">
				{#each post.tags as tagName, idx (idx)}
					<Badge variant="outline" class="cursor-pointer hover:bg-slate-100">
						<span class="text-red-600 font-bold">#</span>&nbsp;{tagName}
					</Badge>
				{/each}
			</div>
		{/if}
		<p class="cst-wrap-text">{post.content}</p>
	</div>

	<div class="px-4 pb-4 flex gap-1">
		<Button
			onclick={() => {
				goto(`/discussion/${post.id}`);
			}}
			variant="outline"
		>
			<MessageSquare />
			<span>{post._count.comment}</span>
		</Button>
		<ReportPostDialog id={post.id} />

    {@render extraActions?.()}
	</div>
</div>

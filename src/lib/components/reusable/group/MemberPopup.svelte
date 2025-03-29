<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ResponsiveDialog from '../global/ResponsiveDialog.svelte';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		countMembers: number;
		groupId: string;
		leader: {
			name: string;
			username: string;
			image: string | null;
		};
	};

	let { countMembers, groupId, leader }: Props = $props();

	let triggerMoreMembersElement: HTMLElement | null = $state(null);
	let isIntersecting = $state(false);
	let open = $state(false);

	let groupMembers = trpc($page).group.getGroupMembers.createInfiniteQuery(
		{ groupId },
		{
			getNextPageParam: (lastPage) => lastPage.data.nextCursor
		}
	);

	$effect(() => {
		if (isIntersecting) {
			$groupMembers.fetchNextPage();
		}
	});
</script>

<ResponsiveDialog
	bind:open
	title={m.group_member_popup_title()}
	description={m.group_member_popup_description()}
	drawerClose={m.group_member_popup_close()}
>
	<section>
		<h2 class="font-bold py-2">Leader</h2>
		<button
			role="option"
			aria-selected="false"
			type="button"
			class="p-2 flex gap-2 hover:bg-secondary rounded-lg cursor-pointer w-full focus:outline-hidden focus:bg-secondary"
		>
			<Avatar.Root class="border m-0 rounded-md">
				<Avatar.Image src={leader.image} alt={leader.username} />
				<Avatar.Fallback class="bg-white">
					{leader.username[0].toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col">
				<h4 class="font-bold">{leader.name}</h4>
				<p class="text-sm text-foreground/60 text-left">{leader.username}</p>
			</div>
		</button>
	</section>

	<section>
		<!-- All members count -1 leader -->
		<div class="flex justify-between items-center py-2">
			<h2 class="font-bold">Members</h2>
			<Badge>{countMembers - 1}</Badge>
		</div>

		<LoadingState isLoading={$groupMembers.isLoading}>
			{#snippet loadingFallback()}
				<div class="p-4 rounded-md w-full"></div>
			{/snippet}

			{#if $groupMembers.data}
				<ScrollArea class="h-72">
					{#each $groupMembers.data.pages.flatMap((page) => page.data.groupMembers) as member, idx (idx)}
						<button
							role="option"
							aria-selected="false"
							type="button"
							class="p-2 flex gap-2 hover:bg-secondary rounded-lg cursor-pointer w-full focus:outline-hidden focus:bg-secondary"
						>
							<Avatar.Root class="border m-0 rounded-md">
								<Avatar.Image src={member.image} alt={member.username} />
								<Avatar.Fallback class="bg-white">
									{member.username[0].toUpperCase()}
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex flex-col">
								<h4 class="font-bold">{member.name}</h4>
								<p class="text-sm text-foreground/60 text-left">{member.username}</p>
							</div>
						</button>
					{/each}

					{#if $groupMembers.data.pages.at(-1)?.data.hasNextPage}
						<IntersectionObserver
							element={triggerMoreMembersElement}
							bind:intersecting={isIntersecting}
						>
							<div bind:this={triggerMoreMembersElement} class="p-4 rounded-md w-full"></div>
						</IntersectionObserver>
					{/if}
				</ScrollArea>
			{/if}
		</LoadingState>
	</section>
</ResponsiveDialog>

<Button variant="link" onclick={() => (open = true)} class="p-0 hover:undeline gap-0">
	<span class="font-bold">{countMembers}</span>&nbsp;Members
</Button>

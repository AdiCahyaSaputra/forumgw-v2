<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { trpc } from '$lib/trpc/client';
	import { Tags, X, UserPlus } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { writable } from 'svelte/store';
	import TagItem from '$lib/components/reusable/discussion/TagItem.svelte';

	type Props = {
		usernames: string[];
	};

	let { usernames = $bindable() }: Props = $props();

	let usernameSearch = $state('');
	let usernameSearchFilter = writable<{ username: string }>({ username: '' });
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const allUsers = trpc($page).user.getUserForInvite.createQuery(usernameSearchFilter);

	const filterUsers = $derived.by(() => {
		const users = $allUsers.data?.data.users;

		let data: typeof users = [];

		if (users) {
			data =
				usernameSearch === ''
					? users
					: users.filter((user) => user.username.toLowerCase().includes(usernameSearch.toLowerCase()));
		}

		return data;
	});

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	$effect(() => {
		console.log(usernameSearch, ' Dari effect');

		const timeout = setTimeout(() => {
			const isExists = $allUsers.data?.data.users.find(
				(user) => user.username.toLowerCase() === usernameSearch.toLowerCase()
			)?.name;

			if (!isExists) {
				$usernameSearchFilter.username = usernameSearch; // Only trigger refetch when current 10 tags is not match with tagSearch
			}
		}, 1000);

		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<div class="flex flex-col mt-4 gap-2 border-t-2 border-dashed border-primary pt-4">
	{#if usernames.length > 0}
		<div class="max-w-80 flex flex-wrap gap-2">
			{#each usernames as username, idx (idx)}
				<Button
					variant="outline"
					onclick={() => {
						const clonedUsers = [...usernames];
						const deletedUsernameIdx = usernames.indexOf(username);

						clonedUsers.splice(deletedUsernameIdx, 1);

						usernames = clonedUsers;
					}}
					size="sm"
				>
					<span>
						<span class="text-red-600 font-bold">@</span>
						{username}
					</span>
					<X />
				</Button>
			{/each}
		</div>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				<Button
					variant="default"
					class="w-full justify-between"
					{...props}
					role="combobox"
					aria-expanded={open}
				>
					Invite Username (Optional)
					<UserPlus />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[200px] p-0" align="start">
			<Command.Root
				onStateChange={(state) => {
					usernameSearch = state.search;
				}}
				shouldFilter={false}
			>
				<Command.Input placeholder="Username..." />
				<Command.List>
					<Command.Group>
							{#each filterUsers as user, idx (idx)}
								<Command.Item
									value={user.username}
									onSelect={() => {
										if (!usernames.includes(user.username)) {
                                            usernames = [...usernames, user.username];
										}

										closeAndFocusTrigger();
									}}
									class="flex justify-between"
								>
                                    <span>
                                        <span class="text-red-600 font-bold">@</span>
                                        {user.username}
                                    </span>
								</Command.Item>
							{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>

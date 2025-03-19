<script lang="ts">
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { trpc } from '$lib/trpc/client';
	import { writable } from 'svelte/store';
	import LoadingState from '../global/LoadingState.svelte';

	let {
		value = $bindable(),
		mentionedUserIds = $bindable(),
		placeholder = m.comment_placeholder(),
		groupId = null,
		formResultType = null,
    defaultValue = '',
		...props
	} = $props();

	let mentionUserFilter = writable({
		username: ''
	});

	let showUserOptions = $state(false);
	let inputRef: HTMLElement | null = $state(null);
	let inputCommentText = $state(defaultValue);

	const users = trpc($page).user.getUserForMentioning.createQuery(mentionUserFilter, {
		enabled: () => showUserOptions // should use closure to get updated state change
	});

	const commentChangeHandler = (commentText: string) => {
		value = commentText;

		if (commentText.includes('@')) {
			const splittedCommentTextInput = commentText.split(' ');
			const lastInputText = splittedCommentTextInput.at(-1) as string; // the index arg of .at() might "out of bound" so it possibly undefined

			showUserOptions = lastInputText.startsWith('@');
			$mentionUserFilter.username = lastInputText.startsWith('@') ? lastInputText : '';
		} else {
			showUserOptions = false;
			$mentionUserFilter.username = '';
		}
	};

	const mentionUserHandler = (user: {
		id: string;
		username: string;
		name: string;
		image: string | null;
	}) => {
		const splittedCommentTextInput = value.split(' ');
		const commentTextCompletion = splittedCommentTextInput.slice(0, -1);
		const lastMentionedUserId = mentionedUserIds.at(-1) as string;

		commentTextCompletion.push(`@${user.username} `);
		value = commentTextCompletion.join(' ');
		inputCommentText = commentTextCompletion.join(' ');

		if (lastMentionedUserId !== user.id) {
			if (!mentionedUserIds.includes(user.id)) {
				mentionedUserIds = [...mentionedUserIds, user.id];
			}
		}

		$mentionUserFilter.username = '';

		if (inputRef) {
			inputRef.focus();
			showUserOptions = false;
		}
	};

	$effect(() => {
		console.log(inputCommentText); // For triggering this effect

		const timeout = setTimeout(() => {
			commentChangeHandler(inputCommentText);
		}, 500);

		return () => clearTimeout(timeout);
	});

	$effect(() => {
		const handleEscKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				showUserOptions = false;
			}
		};

		document.addEventListener('keydown', handleEscKey);

		return () => {
			document.removeEventListener('keydown', handleEscKey);
		};
	});

	$effect(() => {
		if (formResultType && formResultType === 'success') {
			inputCommentText = '';
			value = '';
		}
	});
</script>

<div class="relative">
	<Input
		{...props}
		bind:ref={inputRef}
		bind:value={inputCommentText}
		{placeholder}
		autocomplete="off"
	/>

	{#if showUserOptions}
		<div
			class="absolute top-[105%] z-10 shadow-md p-2 bg-background inset-x-0 rounded-lg border max-h-64 overflow-y-auto"
		>
			<LoadingState isLoading={$users.isLoading}>
				{#snippet loadingFallback()}
					<p>...</p>
				{/snippet}

				{#if $users.data}
					{#if $users.data.data.length > 0}
						{#each $users.data.data as user, idx (idx)}
							<button
								role="option"
								aria-selected="false"
								type="button"
								class="p-2 flex gap-4 hover:bg-secondary rounded-lg cursor-pointer w-full focus:outline-hidden focus:bg-secondary"
								onclick={() => mentionUserHandler(user)}
							>
								<Avatar.Root class="rounded-md border m-0">
									<Avatar.Image src={user.image} alt="@shadcn" />
									<Avatar.Fallback class="bg-white">
										{user.username[0].toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="text-left">
									<h4 class="font-bold lg:text-base text-sm">
										{user.name}
									</h4>
									<p class="lg:text-sm text-xs">@{user.username}</p>
								</div>
							</button>
						{/each}
					{:else}
						<p>{m.empty()}</p>
					{/if}
				{/if}
			</LoadingState>
		</div>
	{/if}
</div>

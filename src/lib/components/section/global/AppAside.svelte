<script lang="ts">
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import NavItem from '$lib/components/reusable/layout/app/NavItem.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import {
		BellRing,
		GanttChartSquare,
		Loader2,
		LogOut,
		Megaphone,
		Menu,
		Rss,
		User
	} from '@lucide/svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { afterNavigate, goto } from '$app/navigation';
	import type { UserPayload } from '$lib/trpc/services/user.js';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';

	type Props = {
		user: UserPayload | null;
	};

	const navCategoryItems = [
		{
			url: '/discussion',
			label: m.nav_item_discussion(),
			icon: Rss
		}
		// {
		// 	url: '/group',
		// 	label: m.nav_item_group(),
		// 	icon: Users
		// }
	];

	const navDashboardItems = [
		{
			url: '/manage-post',
			label: m.nav_item_manage_post(),
			icon: GanttChartSquare
		}
		// {
		// 	url: '/manage-group',
		// 	label: m.nav_item_manage_group(),
		// 	icon: CircleDashed
		// }
	];

	const navSettingItems = [
		{
			url: '/account',
			label: m.nav_item_account(),
			icon: User
		}
	];

	let { user }: Props = $props();

	let openAside = $state(false);
	let isLoggingOut = $state(false);
	let formResult: ActionResult | null = $state(null);

	let notification = trpc($page).notification.getUserNotificationCounts.createQuery();

	afterNavigate(() => {
		openAside = false;
	});
</script>

<aside
	class={`
        lg:border-r p-4 flex flex-col justify-between lg:w-2/12 lg:h-[100vh] h-[100dvh] lg:sticky lg:top-0
        lg:z-10
        bg-slate-50 lg:translate-y-0 transition-transform
        fixed inset-0 ${openAside ? 'translate-y-0' : '-translate-y-[200%]'}
        z-30
    `}
>
	<div>
		<h2 class="text-lg font-bold text-foreground">{m.nav_title_category()}</h2>
		<ul class="space-y-2 mt-2">
			{#each navCategoryItems as item, idx (idx)}
				<NavItem {...item} />
			{/each}
		</ul>

		<h2 class="text-lg font-bold mt-4 text-foreground">{m.nav_title_dashboard()}</h2>
		<ul class="space-y-2 mt-2">
			{#each navDashboardItems as item, idx (idx)}
				<NavItem {...item} />
			{/each}

			{#if user?.role === 'developer'}
				<NavItem url="/reported-post" label={m.nav_item_reported_post()} icon={Megaphone} />
			{/if}
		</ul>

		<h2 class="text-lg font-bold mt-4 text-foreground">{m.nav_title_setting()}</h2>
		<ul class="space-y-2 mt-2">
			{#each navSettingItems as item, idx (idx)}
				<NavItem {...item} />
			{/each}
			<NavItem
				url="/notification"
				label={`${$notification.data?.data.count || ''} ${m.nav_item_notification()}`}
				icon={BellRing}
			/>
			<!-- <NavItem url="/invitation" label={`${1} ${m.nav_item_invite()}`} icon={Mail} /> -->
		</ul>
	</div>

	<div>
		<div class="flex items-start gap-2 bg-white border p-4 rounded-md">
			<Avatar.Root class="rounded-md border">
				<Avatar.Image src={user?.image} alt="@shadcn" />
				<Avatar.Fallback class="bg-white">{user?.username[0].toUpperCase()}</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex items-start grow justify-between">
				<div>
					<LoadingState isLoading={false}>
						{#snippet loadingFallback()}
							<h3
								class="text-sm leading-none font-bold p-1 rounded-md animate-pulse bg-muted text-muted"
							>
								user
							</h3>
						{/snippet}
						<h3 class="text-sm leading-none font-bold">
							{`@${user?.username}`.slice(0, 20)}
						</h3>
					</LoadingState>
					<a href={`/profile/${user?.username}`} class="text-xs hover:underline"
						>{m.see_profile()}</a
					>
				</div>
				<form
					method="POST"
					action="/logout"
					use:enhance={() => {
						isLoggingOut = true;

						return async ({ result }) => {
							formResult = result;
							isLoggingOut = false;

							switch (result.type) {
								case 'failure':
									toast.error((result.data?.message as string) || m.global_error_message());
									break;
								case 'success':
									await goto('/login', { replaceState: true });
									break;
								default:
									toast.error(m.global_error_message());
							}
						};
					}}
				>
					<Button
						type="submit"
						variant="destructive"
						size="icon"
						class="w-max p-2"
						disabled={isLoggingOut || formResult?.type === 'success'}
					>
						{#if isLoggingOut || formResult?.type === 'success'}
							<Loader2 class="w-4 h-4 aspect-square animate-spin" />
						{:else}
							<LogOut class="w-4 h-4 aspect-square" />
						{/if}
					</Button>
				</form>
			</div>
		</div>

		<Button
			class="w-full flex items-center space-x-2 justify-start mt-2 bg-white lg:hidden"
			variant="outline"
			onclick={() => (openAside = false)}
		>
			<Menu class="w-4 aspect-square" />
			<span>{m.mobile_close_menu()}</span>
		</Button>
	</div>
</aside>

<div
	class="fixed lg:hidden bottom-0 p-4 inset-x-0 z-20 bg-white supports-backdrop-filter:bg-white/60 border-t supports-backdrop-filter:backdrop-blur-md"
>
	<Button
		onclick={() => (openAside = true)}
		class="w-full flex items-center justify-start space-x-2"
	>
		<Menu class="w-4 aspect-square" />
		<span>{m.mobile_open_menu()}</span>
	</Button>
</div>

<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import CardNotification from '$lib/components/reusable/notification/CardNotification.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { trpcClientUtils } from '$lib/utils';

	let notifications = trpc($page).notification.getUserNotifications.createQuery();
	let markAsReadMutate = trpc($page).notification.markAsReaded.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			trpcClientUtils($page).notification.getUserNotifications.invalidate();
			trpcClientUtils($page).notification.getUserNotificationCounts.invalidate();
		},
		onError: () => {
			toast.error(m.global_error_message());
		}
	});
</script>

<svelte:head>
	<title>Notification Center</title>
	<meta name="description" content="ForumGW Notification: See what others says about you" />
</svelte:head>

<div class="p-4 border-b sticky top-0 bg-white">
	<h1 class="text-lg font-bold">Notification Center</h1>
</div>

<section class="p-4">
	<LoadingState isLoading={$notifications.isPending}>
		{#snippet loadingFallback()}
			<div class="w-full py-20 bg-secondary rounded-md"></div>
		{/snippet}

		{#if $notifications.data}
			{#if $notifications.data.data.find((notif) => !notif.isRead)}
				<div class="pb-4">
					<Button
						size="sm"
						disabled={$markAsReadMutate.isPending}
						variant="outline"
						onclick={() => $markAsReadMutate.mutate({})}
					>
						{m.notif_mark_all_read()}
					</Button>
				</div>
			{/if}
			<div class="space-y-2">
				{#each $notifications.data.data as notification, idx (idx)}
					<CardNotification
						{notification}
						onNotificationClick={() => {
              if(!notification.isRead) {
                $markAsReadMutate.mutate({ notificationId: notification.id });
              }
            }}
					/>
				{/each}
			</div>
		{/if}
	</LoadingState>
</section>

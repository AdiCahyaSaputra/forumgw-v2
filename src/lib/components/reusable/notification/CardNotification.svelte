<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card';
	import { NotificationType } from '$lib/enum';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowRight } from '@lucide/svelte';
	import { timeAgo } from '$lib/utils';
	import { goto } from '$app/navigation';

	type Props = {
		notification: {
			id: string;
			type: string;
			postId: string;
			commentId: number | null;
			isRead: boolean;
			user: {
				name: string;
				username: string;
				image: string | null;
			};
			createdAt: Date;
		};
		onNotificationClick: () => void;
	};

	let { notification, onNotificationClick }: Props = $props();

	const getNotifMessage = (type: string) => {
		switch (type) {
			case NotificationType.comment:
				return '💬 ' + m.notif_message_type_comment();
			case NotificationType.reply:
				return '📥 ' + m.notif_message_type_reply();
			case NotificationType.report:
				return '😈 ' + m.notif_message_type_report();
			case NotificationType.mention:
				return '🫵 ' + m.notif_message_type_mention();
		}
	};
</script>

<Card.Root
	class={[
		'w-full hover:border-primary cursor-pointer bg-secondary shadow',
		!notification.isRead && 'bg-primary text-white'
	]}
	onclick={() => {
		let query = notification.postId;

		if (notification.commentId) {
			query += '?cid=' + notification.commentId;
		}

		onNotificationClick();

		goto(`/discussion/${query}`);
	}}
>
	<Card.Header class="flex lg:gap-4 flex-row p-4 gap-2">
		<Avatar.Root class="rounded-md border m-0">
			<Avatar.Image src={notification.user.image} alt="@shadcn" />
			<Avatar.Fallback class="bg-white">
				{notification.user.username[0].toUpperCase()}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex grow justify-between items-center gap-4">
			<div class="space-y-1">
				<Card.Title class="line-clamp-1"
					>{notification.user.name} (@{notification.user.username})</Card.Title
				>
				<Card.Description class={['cst-wrap-text', !notification.isRead && 'text-white/80']}>
					{getNotifMessage(notification.type)}
					{timeAgo(notification.createdAt)}
				</Card.Description>
			</div>
			<ArrowRight />
		</div>
	</Card.Header>
</Card.Root>

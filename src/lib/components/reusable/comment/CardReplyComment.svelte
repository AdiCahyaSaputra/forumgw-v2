<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { timeAgo } from '$lib/utils';

	type Props = {
		replyComment: {
			id: number;
			text: string;
			user: {
				name: string;
				username: string;
				image: string | null;
			};
			createdAt: Date;
		};
	};

	const { replyComment }: Props = $props();

</script>

<div class="border-b bg-slate-50">
	<div class="flex items-start gap-2 p-4 pb-2">
		<Avatar.Root class="rounded-md border m-0">
			<Avatar.Image src={replyComment.user?.image} alt="@shadcn" />
			<Avatar.Fallback class="bg-white">
        {replyComment.user.username[0].toUpperCase()}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex items-start grow justify-between">
			<div>
				<h3 class="text-sm leading-none font-bold">{replyComment.user.name}</h3>
				<a href={`/profil/${replyComment.user.username}`} class="text-sm hover:underline">
					{replyComment.user.username}
				</a>
			</div>
		</div>
	</div>

	<div class="px-4 pb-4">
		<small class="text-foreground/60">
			{m.comment_created_at()}
			{timeAgo(replyComment.createdAt)}
		</small>
		<p class="cst-wrap-text">{replyComment.text}</p>
	</div>
</div>

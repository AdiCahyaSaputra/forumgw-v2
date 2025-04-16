<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card';

	type Props = {
		id: string;
		name: string;
		logo: string | null;
		description: string;
		leader: {
			name: string;
			username: string;
			image: string | null;
		};
		_count: {
			members: number;
		};
		alreadyMember?: boolean;
	};

	const { id, name, logo, description, leader, _count, alreadyMember }: Props = $props();

	const handleClick = () => {
		goto(`/group/${id}`);
	};
</script>

<Card.Root class="min-w-2xs hover:border-primary cursor-pointer" onclick={handleClick}>
	<Card.Header>
		<Card.Title class="line-clamp-1">{name}</Card.Title>
		<Card.Description class="line-clamp-1">{description}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col">
			<p><span class="font-bold">{_count.members}</span> Members</p>
			{#if alreadyMember}
				<p class="text-sm text-foreground/60">Including You.</p>
			{/if}
		</div>
	</Card.Content>
	<Card.Footer class="flex gap-2">
		<Avatar.Root class="rounded-md border m-0">
			<Avatar.Image src={leader.image} alt={leader.username} />
			<Avatar.Fallback class="bg-white">
				{leader.username[0].toUpperCase()}
			</Avatar.Fallback>
		</Avatar.Root>

		<div>
			<h3 class="text-sm leading-none font-bold">{leader.name}</h3>
			<a href={`/profile/${leader.username}`} class="text-sm hover:underline">
				{leader.username}
			</a>
		</div>
	</Card.Footer>
</Card.Root>

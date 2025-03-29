import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db/index';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { createNewPostGroupRequst } from '$lib/trpc/schema/groupSchema';
import { groupMembers, groups, users } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	const [groupMetadata] = await db
		.select({
			name: groups.name,
			description: groups.description,
			leader: {
				name: users.name,
				username: users.username,
				image: users.image
			},
			_count: {
				members: sql<number>`
						(
							SELECT COUNT(*) 
							FROM ${groupMembers} 
							WHERE ${groupMembers.groupId} = ${event.params.id}
						)
					`.as('member_count')
			}
		})
		.from(groups)
		.innerJoin(users, eq(groups.leaderId, users.id))
		.where(eq(groups.id, event.params.id))
		.limit(1);

	const members = await db
		.select({
			username: users.username,
			image: users.image
		})
		.from(groupMembers)
		.innerJoin(users, eq(groupMembers.userId, users.id))
		.where(eq(groupMembers.groupId, event.params.id))
		.orderBy(sql`RANDOM()`)
		.limit(3);

	return {
		formCreate: await superValidate(zod(createNewPostGroupRequst())),
		params: event.params,
		groupMetadata: {
			...groupMetadata,
			members
		}
	};
};

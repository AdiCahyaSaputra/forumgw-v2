import { db } from '$lib/server/db';
import { posts, tagPosts, tags } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { and, count, eq, gt, isNull, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { getAllTagsRequest } from '../schema/tagSchema';
import { isGroupMemberCheck } from './group';
import type { UserPayload } from './user';

export const getAllTags = async (input: z.infer<typeof getAllTagsRequest>, user: UserPayload) => {
	const { groupId, cursor, name, onlyCurrentUser, userId } = input;

	const condition = [];

	if (groupId) {
		const isGroupMember = await isGroupMemberCheck(groupId, user);

		if (!isGroupMember) {
			return sendTRPCResponse(
				{
					status: 404,
					message: 'not found'
				},
				{
					tags: [],
					nextCursor: null,
					hasNextPage: false
				}
			);
		}

		condition.push(eq(posts.groupId, groupId));
	} else {
		condition.push(isNull(posts.groupId));
	}

	if (cursor) {
		condition.push(gt(tags.id, cursor));
	}

	if (userId) {
		condition.push(eq(posts.userId, userId));
	}

	if (onlyCurrentUser) {
		condition.push(eq(posts.userId, user.id));
	}

	if (name) {
		condition.push(like(tags.name, `%${name}%`));
	}

	const limit = 10;

	const allTags = await db
		.select({
			id: tags.id,
			name: tags.name,
			_count: {
				post: count(tagPosts.id).as('post_count')
			}
		})
		.from(tags)
		.innerJoin(tagPosts, eq(tagPosts.tagId, tags.id))
		.innerJoin(posts, eq(posts.id, tagPosts.postId))
		.where(and(...condition))
		.groupBy(tags.id, tags.name)
		.orderBy(sql`post_count DESC`)
		.limit(limit + 1);

	const hasNextPage = allTags.length > limit;
	const paginatedResults = allTags.slice(0, limit);
	const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

	return sendTRPCResponse(
		{
			status: allTags.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			tags: allTags,
			nextCursor,
			hasNextPage
		}
	);
};

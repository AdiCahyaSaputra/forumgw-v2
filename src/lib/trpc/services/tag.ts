import { db } from '$lib/server/db';
import { tagPosts, tags } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { and, count, eq, gt, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { getAllTagsRequest } from '../schema/tagSchema';

export const getAllTags = async (input: z.infer<typeof getAllTagsRequest>) => {
	const condition = [];

	if (input.cursor) {
		condition.push(gt(tags.id, input.cursor));
	}

	if (input.name) {
		condition.push(like(tags.name, `%${input.name}%`));
	}

	const allTags = await db
		.select({
			id: tags.id,
			name: tags.name,
			_count: {
				post: count(tagPosts.id).as('post_count')
			}
		})
		.from(tags)
		.leftJoin(tagPosts, eq(tagPosts.tagId, tags.id))
		.where(and(...condition))
		.groupBy(tags.id)
		.orderBy(sql`post_count DESC`)
		.limit(10);

	return sendTRPCResponse(
		{
			status: allTags.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			tags: allTags,
			nextCursor: allTags.length > 0 ? allTags.at(-1)?.id : null
		}
	);
};

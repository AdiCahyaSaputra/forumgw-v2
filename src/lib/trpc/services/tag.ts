import { db } from '$lib/server/db';
import { tagPosts, tags } from '$lib/server/db/schema';
import { z } from 'zod';
import type { getAllTagsRequest } from '../schema/tagSchema';
import { and, count, eq, gt, isNotNull } from 'drizzle-orm';
import { sendTRPCResponse } from '$lib/utils';

export const getAllTags = async (input: z.infer<typeof getAllTagsRequest>) => {
  const condition = [isNotNull(tagPosts.id)];

  if (input.cursor) {
    condition.push(gt(tags.id, input.cursor));
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
    .orderBy(tags.id)
    .groupBy(tags.id)
    .limit(20);

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

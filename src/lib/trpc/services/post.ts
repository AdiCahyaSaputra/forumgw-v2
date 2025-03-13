import { db } from '$lib/server/db';
import { anonymous, comments, posts, reports, tagPosts, tags, users } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { and, count, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { getPublicPostDiscussionsRequest, reportPostRequest } from '../schema/postSchema';
import * as m from '$lib/paraglide/messages.js';

export const getPublicPostDiscussions = async (
  input: z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>
) => {
  const conditions = [
    // This is not Group Posts. This is public post only
    isNull(posts.groupId)
  ];

  if (input.tagIds.length > 0) {
    conditions.push(inArray(tags.id, input.tagIds));
  }

  const results = await db
    .select({
      id: posts.id,
      content: posts.content,
      cretedAt: posts.createdAt,
      user: sql<null | { name: string; username: string; image: string | null }>`
        CASE 
          WHEN ${posts.userId} IS NULL THEN NULL
          ELSE jsonb_build_object(
            'name', ${users.name},
            'username', ${users.username},
            'image', ${users.image}
          )
        END
      `.as('user'),
      anonymous: sql<null | { name: string; username: string }>`
        CASE 
          WHEN ${posts.anonymousId} IS NULL THEN NULL
          ELSE jsonb_build_object(
            'name', 'Anonymous',
            'username', '@0x0'
          )
        END
      `.as('anonymous'),
      tags: sql<string[]>`
          COALESCE(
            array_agg(DISTINCT ${tags.name})
            FILTER (WHERE ${tags.name} IS NOT NULL),
            '{}'
          )
      `.as('tags'), // '{}' would be translated to empty array [] on JS
      _count: {
        comment: count(comments.id).as('comment_count')
      }
    })
    .from(posts)
    .leftJoin(comments, eq(posts.id, comments.postId))
    .leftJoin(tagPosts, eq(posts.id, tagPosts.postId))
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(anonymous, eq(posts.anonymousId, anonymous.id))
    .leftJoin(tags, eq(tagPosts.tagId, tags.id))
    .where(and(...conditions))
    .groupBy(
      // Include Non-Aggregated Column or ERROR
      posts.id,
      posts.userId,
      posts.anonymousId,
      posts.content,
      posts.createdAt,
      users.name,
      users.username,
      users.image
    );

  return sendTRPCResponse(
    {
      status: results.length > 0 ? 200 : 404,
      message: 'ok'
    },
    results
  );
};

export const reportPost = async (input: z.infer<typeof reportPostRequest>) => {
  const result = await db
    .insert(reports)
    .values({
      postId: input.id,
      reason: input.reason
    })
    .then(() =>
      sendTRPCResponse({
        status: 201,
        message: m.post_report_success()
      })
    )
    .catch(() =>
      sendTRPCResponse({
        status: 500,
        message: 'error'
      })
    );

  return result;
};

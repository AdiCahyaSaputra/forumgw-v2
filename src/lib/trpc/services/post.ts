import { isGroupMemberCheck } from './group';
import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { anonymous, comments, posts, reports, tagPosts, tags, users } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { and, eq, inArray, isNull, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import type {
  createPostRequest,
  getPublicPostDiscussionsRequest,
  reportPostRequest
} from '../schema/postSchema';
import { getPostDetailRequest } from './../schema/postSchema';
import type { UserPayload } from './user';

export const getPublicPostDiscussions = async (
	input: z.infer<ReturnType<typeof getPublicPostDiscussionsRequest>>,
  user: UserPayload
) => {
	const { tagIds, cursor, groupId } = input;

	const limit = 10;
	const conditions = [];

	if (groupId) {
		const isGroupMember = await isGroupMemberCheck(groupId, user);

		if (!isGroupMember) {
			return sendTRPCResponse({
				status: 403,
				message: 'You are not a member of this group'
			}, {
        posts: [],
        nextCursor: null,
        hasNextPage: false
      });
		}

		conditions.push(eq(posts.groupId, groupId));
	} else {
		conditions.push(isNull(posts.groupId));
	}

	if (tagIds.length > 0) {
		conditions.push(inArray(tags.id, tagIds));
	}

	if (cursor) {
		conditions.push(lt(posts.id, cursor));
	}

	const results = await db
		.select({
			id: posts.id,
			content: posts.content,
			createdAt: posts.createdAt,
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
				comment: sql<number>`
        (
          SELECT COUNT(*) 
          FROM ${comments} 
          WHERE ${comments.postId} = ${posts.id}
        )
      `.as('comment_count')
			}
		})
		.from(posts)
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
		)
		.orderBy(sql`created_at DESC`)
		.limit(limit + 1);

	const hasNextPage = results.length > limit;
	const paginatedResults = results.slice(0, limit);
	const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

	return sendTRPCResponse(
		{
			status: results.length > 0 ? 200 : 404,
			message: 'ok'
		},
		{
			posts: paginatedResults,
			nextCursor,
			hasNextPage
		}
	);
};

export const getPostDetail = async (input: z.infer<typeof getPostDetailRequest>) => {
	const { id } = input;

	const [postDetail] = await db
		.select({
			id: posts.id,
			content: posts.content,
			createdAt: posts.createdAt,
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
				comment: sql<number>`
        (
          SELECT COUNT(*) 
          FROM ${comments} 
          WHERE ${comments.postId} = ${posts.id}
        )
      `.as('comment_count')
			}
		})
		.from(posts)
		.leftJoin(tagPosts, eq(posts.id, tagPosts.postId))
		.leftJoin(users, eq(posts.userId, users.id))
		.leftJoin(anonymous, eq(posts.anonymousId, anonymous.id))
		.leftJoin(tags, eq(tagPosts.tagId, tags.id))
		.where(eq(posts.id, id))
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
		)
		.orderBy(sql`created_at DESC`)
		.limit(1);

	return sendTRPCResponse(
		{
			status: postDetail ? 200 : 404,
			message: 'ok'
		},
		{
			post: postDetail
		}
	);
};

export const createNewPost = async (
	input: z.infer<ReturnType<typeof createPostRequest>>,
	user: UserPayload,
) => {
	const { isAnonymous, content, tags: tagsName, groupId } = input;

  if(groupId){
    const isGroupMember = await isGroupMemberCheck(groupId, user);

    if (!isGroupMember) {
      return sendTRPCResponse({
        status: 403,
        message: 'You are not a member of this group'
      });
    }
  }

	try {
		const trpcResponse = await db.transaction(async (tx) => {
			let anonymousUserId: (typeof anonymous.$inferSelect)['id'] | null = null;

			if (isAnonymous) {
				const isAnonymousUserExists = await tx
					.select({ id: anonymous.id })
					.from(anonymous)
					.where(eq(anonymous.userId, user.id))
					.limit(1);

				if (isAnonymousUserExists.length > 0) {
					anonymousUserId = isAnonymousUserExists[0].id;
				} else {
					const [newAnonymousUser] = await tx
						.insert(anonymous)
						.values({ userId: user.id })
						.returning({ id: anonymous.id });

					anonymousUserId = newAnonymousUser.id;
				}
			}

			const [newPost] = await tx
				.insert(posts)
				.values({
					groupId,
					content,
					...(isAnonymous ? { anonymousId: anonymousUserId } : { userId: user.id })
				})
				.returning({ id: posts.id });

			if (tagsName.length > 0) {
				const existingTags = await tx
					.select({ name: tags.name, id: tags.id })
					.from(tags)
					.where(inArray(tags.name, tagsName));

				const tagsData = tagsName
					.filter((tagName) => !existingTags.find((tag) => tagName === tag.name))
					.map((name) => ({ name }));

				let newTags: typeof existingTags = [];

				if (tagsData.length > 0) {
					newTags = await tx.insert(tags).values(tagsData).returning({
						id: tags.id,
						name: tags.name
					});
				}

				const tagPostsData = [...existingTags, ...newTags].map((tag) => ({
					tagId: tag.id,
					postId: newPost.id
				}));

				if (tagPostsData.length > 0) {
					await tx.insert(tagPosts).values(tagPostsData);
				}
			}

			return sendTRPCResponse({
				status: 201,
				message: m.post_create_success()
			});
		});

		return trpcResponse;
	} catch (error) {
		console.error('Transaction failed:', error);

		return sendTRPCResponse({
			status: 500,
			message: m.global_error_message()
		});
	}
};

export const reportPost = async (input: z.infer<typeof reportPostRequest>) => {
	const result = await db
		.insert(reports)
		.values({
			postId: input.id,
			reason: input.reason || '-'
		})
		.then(() =>
			sendTRPCResponse({
				status: 200,
				message: m.post_report_success()
			})
		)
		.catch(() =>
			sendTRPCResponse({
				status: 500,
				message: m.global_error_message()
			})
		);

	return result;
};

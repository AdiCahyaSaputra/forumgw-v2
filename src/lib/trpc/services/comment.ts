import { NotificationType } from '$lib/enum';
import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import {
  anonymous,
  comments,
  groupMembers,
  notifications,
  posts,
  replyComments,
  users
} from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import type {
  commentRequest,
  deleteCommentRequest,
  deleteReplyCommentRequest,
  getPostCommentsRequest,
  getReplyCommentsRequest,
  replyCommentRequest
} from '../schema/commentSchema';
import type { UserPayload } from './user';

type TInsertMentionNotification = {
  postId: string;
  userId: string;
  type: NotificationType;
  isRead: boolean;
};

const notifyMentionedUser = async (
  userIds: string[],
  data: TInsertMentionNotification,
  tx: Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
) => {
  const notificationsData = userIds.map((mentionedUserId) => ({
    ...data,
    toUser: mentionedUserId
  }));

  await tx.insert(notifications).values(notificationsData);
};

export const getPostComments = async (input: z.infer<typeof getPostCommentsRequest>) => {
  const limit = 10;
  const conditions = [eq(comments.postId, input.postId)];

  if (input.cursor) {
    conditions.push(lt(comments.id, input.cursor));
  }

  const postComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      postId: comments.postId,
      user: {
        name: users.name,
        username: users.username,
        image: users.image
      },
      createdAt: comments.createdAt,
      _count: {
        replies: sql<number>`
        (
          SELECT COUNT(*) 
          FROM ${replyComments} 
          WHERE ${replyComments.commentId} = ${comments.id}
        )
      `.as('replies_count')
      }
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(and(...conditions))
    .groupBy(
      comments.id,
      comments.postId,
      comments.text,
      users.name,
      users.username,
      users.image,
      comments.createdAt
    )
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  const hasNextPage = postComments.length > limit;
  const paginatedResults = postComments.slice(0, limit);
  const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

  return sendTRPCResponse(
    {
      status: postComments.length > 0 ? 200 : 404,
      message: 'ok'
    },
    {
      comments: paginatedResults,
      nextCursor,
      hasNextPage
    }
  );
};

export const getReplyComments = async (input: z.infer<typeof getReplyCommentsRequest>) => {
  const limit = 10;
  const conditions = [eq(replyComments.commentId, input.commentId)];

  if (input.cursor) {
    conditions.push(lt(replyComments.id, input.cursor));
  }

  const replies = await db
    .select({
      id: replyComments.id,
      text: replyComments.text,
      user: {
        name: users.name,
        username: users.username,
        image: users.image
      },
      createdAt: replyComments.createdAt
    })
    .from(replyComments)
    .innerJoin(users, eq(users.id, replyComments.userId))
    .where(and(...conditions))
    .orderBy(desc(replyComments.createdAt))
    .limit(limit + 1);

  const hasNextPage = replies.length > limit;
  const paginatedResults = replies.slice(0, limit);
  const nextCursor = hasNextPage ? paginatedResults[limit - 1].id : null;

  return sendTRPCResponse(
    {
      status: replies.length > 0 ? 200 : 404,
      message: 'ok'
    },
    {
      replies: paginatedResults,
      nextCursor,
      hasNextPage
    }
  );
};

export const createComment = async (
  input: z.infer<ReturnType<typeof commentRequest>>,
  user: UserPayload
) => {
  const { text, postId, mentionUsers, groupId } = input;

  const mentionedUserIds = mentionUsers?.split(',');
  let memberGroupIds: string[] = [];

  if (groupId) {
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    memberGroupIds = members.map((member) => member.userId);

    // Check if current user is member of this group or not
    if (!memberGroupIds.includes(user.id)) {
      return sendTRPCResponse({
        status: 403,
        message: m.comment_create_group_unauthorized_error()
      });
    }
  }

  const [post] = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      anonymous: {
        userId: anonymous.userId
      }
    })
    .from(posts)
    .leftJoin(anonymous, eq(anonymous.id, posts.anonymousId))
    .where(eq(posts.id, postId))
    .limit(1);

  const authorId = post.userId ?? post.anonymous?.userId;

  if (!post || !authorId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const response = db
    .transaction(async (tx) => {
      await tx.insert(comments).values({
        postId: post.id,
        text,
        userId: user.id
      });

      if (user.id !== authorId) {
        await tx.insert(notifications).values({
          postId: post.id,
          userId: user.id,
          toUser: authorId,
          isRead: false,
          type: NotificationType.comment
        });
      }

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        // Do not create double notification (on comment + on mention)
        let allowedMentionUsers = mentionedUserIds.filter((userId) => userId !== authorId);

        if (memberGroupIds.length > 0) {
          // Mentioned users should be valid group member
          allowedMentionUsers = mentionedUserIds.filter((userId) =>
            memberGroupIds.includes(userId)
          );
        }

        if (allowedMentionUsers.length > 0) {
          await notifyMentionedUser(
            allowedMentionUsers,
            {
              postId: post.id,
              userId: user.id,
              type: NotificationType.mention,
              isRead: false
            },
            tx
          );
        }
      }
    })
    .then(() => {
      return sendTRPCResponse({
        status: 201,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

export const editComment = async (
  input: z.infer<ReturnType<typeof commentRequest>>,
  user: UserPayload
) => {
  const { text, postId, mentionUsers, groupId, commentId } = input;

  if (!commentId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const mentionedUserIds = mentionUsers?.split(',');
  let memberGroupIds: string[] = [];

  if (groupId) {
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    memberGroupIds = members.map((member) => member.userId);

    // Check if current user is member of this group or not
    if (!memberGroupIds.includes(user.id)) {
      return sendTRPCResponse({
        status: 403,
        message: m.comment_create_group_unauthorized_error()
      });
    }
  }

  const [post] = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      anonymous: {
        userId: anonymous.userId
      }
    })
    .from(posts)
    .leftJoin(anonymous, eq(anonymous.id, posts.anonymousId))
    .where(eq(posts.id, postId))
    .limit(1);

  const authorId = post.userId ?? post.anonymous?.userId;

  if (!post || !authorId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const response = db
    .transaction(async (tx) => {
      await tx
        .update(comments)
        .set({
          text
        })
        .where(and(eq(comments.id, commentId), eq(comments.userId, user.id)));

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        // Do not create double notification (on comment + on mention)
        let allowedMentionUsers = mentionedUserIds.filter((userId) => userId !== authorId);

        if (memberGroupIds.length > 0) {
          // Mentioned users should be valid group member
          allowedMentionUsers = mentionedUserIds.filter((userId) =>
            memberGroupIds.includes(userId)
          );
        }

        if (allowedMentionUsers.length > 0) {
          await notifyMentionedUser(
            allowedMentionUsers,
            {
              postId: post.id,
              userId: user.id,
              type: NotificationType.mention,
              isRead: false
            },
            tx
          );
        }
      }
    })
    .then(() => {
      return sendTRPCResponse({
        status: 200,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

export const deleteComment = async (
  input: z.infer<typeof deleteCommentRequest>,
  user: UserPayload
) => {
  const { commentId } = input;

  const response = db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, user.id)))
    .then(() => {
      return sendTRPCResponse({
        status: 200,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

export const replyComment = async (
  input: z.infer<ReturnType<typeof replyCommentRequest>>,
  user: UserPayload
) => {
  const { text, commentId, mentionUsers, groupId } = input;

  const mentionedUserIds = mentionUsers?.split(',');
  let memberGroupIds: string[] = [];

  if (groupId) {
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    memberGroupIds = members.map((member) => member.userId);

    // Check if current user is member of this group or not
    if (!memberGroupIds.includes(user.id)) {
      return sendTRPCResponse({
        status: 403,
        message: m.comment_create_group_unauthorized_error()
      });
    }
  }

  const [comment] = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.id, commentId))
    .limit(1);

  const authorId = comment.userId;

  if (!comment || !authorId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const response = db
    .transaction(async (tx) => {
      await tx.insert(replyComments).values({
        commentId: comment.id,
        text,
        userId: user.id
      });

      if (user.id !== authorId) {
        await tx.insert(notifications).values({
          postId: comment.postId,
          userId: user.id,
          toUser: authorId,
          isRead: false,
          type: NotificationType.reply
        });
      }

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        // Do not create double notification (on comment + on mention)
        let allowedMentionUsers = mentionedUserIds.filter((userId) => userId !== authorId);

        if (memberGroupIds.length > 0) {
          // Mentioned users should be valid group member
          allowedMentionUsers = mentionedUserIds.filter((userId) =>
            memberGroupIds.includes(userId)
          );
        }

        if (allowedMentionUsers.length > 0) {
          await notifyMentionedUser(
            allowedMentionUsers,
            {
              postId: comment.postId,
              userId: user.id,
              type: NotificationType.mention,
              isRead: false
            },
            tx
          );
        }
      }
    })
    .then(() => {
      return sendTRPCResponse({
        status: 201,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

export const editReplyComment = async (
  input: z.infer<ReturnType<typeof replyCommentRequest>>,
  user: UserPayload
) => {
  const { text, commentId, mentionUsers, groupId, replyCommentId } = input;

  if (!replyCommentId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const mentionedUserIds = mentionUsers?.split(',');
  let memberGroupIds: string[] = [];

  if (groupId) {
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    memberGroupIds = members.map((member) => member.userId);

    // Check if current user is member of this group or not
    if (!memberGroupIds.includes(user.id)) {
      return sendTRPCResponse({
        status: 403,
        message: m.comment_create_group_unauthorized_error()
      });
    }
  }

  const [comment] = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.id, commentId))
    .limit(1);

  const authorId = comment.userId;

  if (!comment || !authorId) {
    return sendTRPCResponse({
      status: 404,
      message: 'Virus alrady installed on your computer'
    });
  }

  const response = db
    .transaction(async (tx) => {
      await tx
        .update(replyComments)
        .set({
          text
        })
        .where(and(eq(replyComments.id, replyCommentId), eq(replyComments.userId, user.id)));

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        // Do not create double notification (on comment + on mention)
        let allowedMentionUsers = mentionedUserIds.filter((userId) => userId !== authorId);

        if (memberGroupIds.length > 0) {
          // Mentioned users should be valid group member
          allowedMentionUsers = mentionedUserIds.filter((userId) =>
            memberGroupIds.includes(userId)
          );
        }

        if (allowedMentionUsers.length > 0) {
          await notifyMentionedUser(
            allowedMentionUsers,
            {
              postId: comment.postId,
              userId: user.id,
              type: NotificationType.mention,
              isRead: false
            },
            tx
          );
        }
      }
    })
    .then(() => {
      return sendTRPCResponse({
        status: 200,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

export const deleteReplyComment = async (
  input: z.infer<typeof deleteReplyCommentRequest>,
  user: UserPayload
) => {
  const { replyCommentId } = input;

  const response = db
    .delete(replyComments)
    .where(and(eq(replyComments.id, replyCommentId), eq(replyComments.userId, user.id)))
    .then(() => {
      return sendTRPCResponse({
        status: 200,
        message: 'ok'
      });
    })
    .catch(() => {
      return sendTRPCResponse({
        status: 500,
        message: m.global_error_message()
      });
    });

  return response;
};

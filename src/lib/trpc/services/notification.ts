import { db } from '$lib/server/db';
import { and, eq, sql } from 'drizzle-orm';
import type { UserPayload } from './user';
import { notifications, users } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import * as m from '$lib/paraglide/messages.js';
import { markAsReadedRequest } from '../schema/notificationSchema';
import { z } from 'zod';

export const getUserNotificationCounts = async (user: UserPayload) => {
  const [notificationCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.toUser, user.id), eq(notifications.isRead, false)))
    .limit(1);

  return sendTRPCResponse(
    {
      status: 200,
      message: 'ok'
    },
    notificationCount || { count: 0 }
  );
};

export const getUserNotifications = async (user: UserPayload) => {
  const conditions = [eq(notifications.toUser, user.id)];

  const userNotifications = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      postId: notifications.postId,
      commentId: notifications.commentId,
      isRead: notifications.isRead,
      user: {
        name: users.name,
        username: users.username,
        image: users.image
      },
      createdAt: notifications.createdAt
    })
    .from(notifications)
    .innerJoin(users, eq(notifications.userId, users.id))
    .where(and(...conditions))
    .orderBy(notifications.isRead); // isRead false first

  return sendTRPCResponse(
    {
      status: userNotifications.length > 0 ? 200 : 404,
      message: 'ok'
    },
    userNotifications
  );
};

export const markAsReaded = async (
  input: z.infer<typeof markAsReadedRequest>,
  user: UserPayload
) => {
  const { notificationId } = input;

  const conditions = [eq(notifications.toUser, user.id), eq(notifications.isRead, false)];

  if (notificationId) {
    conditions.push(eq(notifications.id, notificationId));
  }

  const response = await db
    .update(notifications)
    .set({
      isRead: true
    })
    .where(and(...conditions))
    .then(() => sendTRPCResponse({ status: 200, message: 'ok' }))
    .catch(() => sendTRPCResponse({ status: 500, message: m.global_error_message() }));

  return response;
};

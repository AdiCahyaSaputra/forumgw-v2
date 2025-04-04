import { t } from '../t';
import { logger } from '../middleware/logger';
import { authenticated } from '../middleware/authenticated';
import { getUserNotificationCounts, getUserNotifications, markAsReaded } from '../services/notification';
import { markAsReadedRequest } from '../schema/notificationSchema';

export const notification = t.router({
	getUserNotificationCounts: t.procedure
		.use(logger)
		.use(authenticated)
		.query(({ ctx }) => getUserNotificationCounts(ctx.user)),
  getUserNotifications: t.procedure
    .use(logger)
    .use(authenticated)
    .query(({ ctx }) => getUserNotifications(ctx.user)),
  markAsReaded: t.procedure
    .use(logger)
    .use(authenticated)
    .input(markAsReadedRequest)
    .mutation(({ ctx, input }) => markAsReaded(input, ctx.user)),
});

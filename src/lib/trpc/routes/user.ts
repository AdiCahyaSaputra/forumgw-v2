import { logger } from '$lib/trpc/middleware/logger';
import { authenticated } from '../middleware/authenticated';
import { getUserForMentioningRequest } from '../schema/userSchema';
import { getUserForMentioning } from '../services/user';
import { t } from '../t';

export const user = t.router({
	getUserForMentioning: t.procedure
		.use(logger)
		.use(authenticated)
		.input(getUserForMentioningRequest)
		.query(({ input, ctx }) => getUserForMentioning(input, ctx.user))
});

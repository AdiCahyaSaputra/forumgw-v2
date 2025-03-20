import { logger } from '$lib/trpc/middleware/logger';
import { authenticated } from '../middleware/authenticated';
import { getUserForMentioningRequest } from '../schema/userSchema';
import { getUserForMentioning, registeringNewUser } from '../services/user';
import { t } from '../t';
import { authenticateUser } from '../services/user';
import { loginSchema } from '../schema/loginSchema';
import { registerSchema } from '../schema/registerSchema';

export const user = t.router({
  login: t.procedure
    .use(logger)
    .input(loginSchema())
    .mutation(({ input, ctx }) => authenticateUser(input, ctx)),
  register: t.procedure
    .use(logger)
    .input(registerSchema())
    .mutation(({ input }) => registeringNewUser(input)),
	getUserForMentioning: t.procedure
		.use(logger)
		.use(authenticated)
		.input(getUserForMentioningRequest)
		.query(({ input, ctx }) => getUserForMentioning(input, ctx.user))
});

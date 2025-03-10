import { t } from '../t';
import { logger } from '$lib/trpc/middleware/logger';
import { loginSchema } from '../../../routes/login/schema';
import { sendTRPCResponse } from '../helper';

export const user = t.router({
  login: t.procedure
    .use(logger)
    .input(loginSchema())
    .mutation(({ input, ctx }) => sendTRPCResponse({ status: 200, message: 'ok' }, { input, ctx }))
});

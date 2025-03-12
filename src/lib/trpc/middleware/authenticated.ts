import { t } from '$lib/trpc/t';
import { TRPCError } from '@trpc/server';

export const authenticated = t.middleware(async ({ ctx, next }) => {
  const { user } = ctx;

  if (user === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      user
    }
  });
});

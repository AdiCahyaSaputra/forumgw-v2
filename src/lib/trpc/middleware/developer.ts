import { t } from '$lib/trpc/t';
import { TRPCError } from '@trpc/server';

export const developer = t.middleware(async ({ ctx, next }) => {
	const { user } = ctx;

	if (user === null) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	if (user.role !== 'developer') {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return next({
		ctx: {
			user
		}
	});
});

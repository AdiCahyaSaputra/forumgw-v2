import { t } from '../t';
import { logger } from '$lib/trpc/middleware/logger';
import { authenticated } from '../middleware/authenticated';
import { getAllTagsRequest } from '../schema/tagSchema';
import { getAllTags } from '../services/tag';

export const tag = t.router({
	getAllTags: t.procedure
		.use(logger)
		.use(authenticated)
		.input(getAllTagsRequest)
		.query(({ input, ctx }) => getAllTags(input, ctx.user))
});

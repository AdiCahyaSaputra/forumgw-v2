import { logger } from '$lib/trpc/middleware/logger';
import { getPostDetailRequest, getPublicPostDiscussionsRequest } from '../schema/postSchema';
import { getPostDetail, getPublicPostDiscussions } from '../services/post';
import { t } from '../t';

export const post = t.router({
	getPublicPostDiscussions: t.procedure
		.use(logger)
		.input(getPublicPostDiscussionsRequest())
		.query(({ input }) => getPublicPostDiscussions(input)),
	getPostDetail: t.procedure
		.use(logger)
		.input(getPostDetailRequest)
		.query(({ input }) => getPostDetail(input))
});

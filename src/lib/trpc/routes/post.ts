import { logger } from '$lib/trpc/middleware/logger';
import { createPostRequest, getPostDetailRequest, getPublicPostDiscussionsRequest, reportPostRequest } from '../schema/postSchema';
import { createNewPost, getPostDetail, getPublicPostDiscussions, reportPost } from '../services/post';
import { t } from '../t';
import { authenticated } from '../middleware/authenticated';

export const post = t.router({
	getPublicPostDiscussions: t.procedure
		.use(logger)
    .use(authenticated)
		.input(getPublicPostDiscussionsRequest())
		.query(({ input, ctx }) => getPublicPostDiscussions(input, ctx.user)),
	getPostDetail: t.procedure
		.use(logger)
		.input(getPostDetailRequest)
		.query(({ input }) => getPostDetail(input)),
  createPost: t.procedure
    .use(logger)
    .use(authenticated)
    .input(createPostRequest())
    .mutation(({ input, ctx }) => createNewPost(input, ctx.user)),
  reportPost: t.procedure
    .use(logger)
    .use(authenticated)
    .input(reportPostRequest)
    .mutation(({ input }) => reportPost(input))
});

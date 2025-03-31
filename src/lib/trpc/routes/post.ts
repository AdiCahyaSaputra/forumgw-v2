import { logger } from '$lib/trpc/middleware/logger';
import { createPostRequest, deletePostRequest, editPostRequest, getPostDetailRequest, getPublicPostDiscussionsRequest, reportPostRequest } from '../schema/postSchema';
import { createNewPost, deletePost, editPost, getPostDetail, getPublicPostDiscussions, reportPost } from '../services/post';
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
  editPost: t.procedure
    .use(logger)
    .use(authenticated)
    .input(editPostRequest())
    .mutation(({ input, ctx }) => editPost(input, ctx.user)),
  deletePost: t.procedure
    .use(logger)
    .use(authenticated)
    .input(deletePostRequest)
    .mutation(({ input, ctx }) => deletePost(input, ctx.user)),
  reportPost: t.procedure
    .use(logger)
    .use(authenticated)
    .input(reportPostRequest)
    .mutation(({ input }) => reportPost(input))
});

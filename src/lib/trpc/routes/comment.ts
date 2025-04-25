import { logger } from '$lib/trpc/middleware/logger';
import { authenticated } from '../middleware/authenticated';
import {
	commentRequest,
	deleteCommentRequest,
	deleteReplyCommentRequest,
	getPostCommentsRequest,
	getReplyCommentsRequest,
	replyCommentRequest
} from '../schema/commentSchema';
import {
	createComment,
	deleteComment,
	deleteReplyComment,
	editComment,
	editReplyComment,
	getPostComments,
	getReplyComments
} from '../services/comment';
import { t } from '../t';

export const comment = t.router({
	getPostComments: t.procedure
		.use(logger)
		.input(getPostCommentsRequest)
		.query(({ input }) => getPostComments(input)),
	getReplyComments: t.procedure
		.use(logger)
		.input(getReplyCommentsRequest)
		.query(({ input }) => getReplyComments(input)),
	createComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(commentRequest())
		.mutation(({ input, ctx }) => createComment(input, ctx.user)),
	editComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(commentRequest())
		.mutation(({ input, ctx }) => editComment(input, ctx.user)),
	replyComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(replyCommentRequest())
		.mutation(({ input, ctx }) => editReplyComment(input, ctx.user)),
	editReplyComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(replyCommentRequest())
		.mutation(({ input, ctx }) => editReplyComment(input, ctx.user)),
	deleteComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(deleteCommentRequest)
		.mutation(({ input, ctx }) => deleteComment(input, ctx.user)),
	deleteReplyComment: t.procedure
		.use(logger)
		.use(authenticated)
		.input(deleteReplyCommentRequest)
		.mutation(({ input, ctx }) => deleteReplyComment(input, ctx.user))
});

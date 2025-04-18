import { logger } from '$lib/trpc/middleware/logger';
import { authenticated } from '../middleware/authenticated';
import {
  deleteCommentRequest,
  deleteReplyCommentRequest,
  getPostCommentsRequest,
  getReplyCommentsRequest
} from '../schema/commentSchema';
import { deleteComment, deleteReplyComment, getPostComments, getReplyComments } from '../services/comment';
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

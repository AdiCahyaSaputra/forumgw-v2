import { logger } from '$lib/trpc/middleware/logger';
import { getPostCommentsRequest, getReplyCommentsRequest } from '../schema/commentSchema';
import { getPostComments, getReplyComments } from '../services/comment';
import { t } from '../t';

export const comment = t.router({
	getPostComments: t.procedure
		.use(logger)
		.input(getPostCommentsRequest)
		.query(({ input }) => getPostComments(input)),
	getReplyComments: t.procedure
		.use(logger)
		.input(getReplyCommentsRequest)
		.query(({ input }) => getReplyComments(input))
});

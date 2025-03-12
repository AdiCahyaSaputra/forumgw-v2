import { t } from '../t';
import { logger } from '$lib/trpc/middleware/logger';
import { getPublicPostDiscussionsRequest } from '../schema/postSchema';
import { getPublicPostDiscussions } from '../services/post';

export const post = t.router({
  getPublicPostDiscussions: t.procedure
    .use(logger)
    .input(getPublicPostDiscussionsRequest())
    .query(({ input }) => getPublicPostDiscussions(input))
});

import { authenticated } from '../middleware/authenticated';
import { developer } from '../middleware/developer';
import { logger } from '../middleware/logger';
import { getReportMessageRequest, safePostRequest } from '../schema/reportSchema';
import { getReportMessage, safePost, takeDownPost } from '../services/report';
import { t } from '../t';

export const report = t.router({
	getReportMessage: t.procedure
		.use(logger)
		.use(authenticated)
		.use(developer)
		.input(getReportMessageRequest)
		.query(({ input }) => getReportMessage(input)),
	safePost: t.procedure
		.use(logger)
		.use(authenticated)
		.use(developer)
		.input(safePostRequest)
		.mutation(({ input }) => safePost(input)),
	takeDownPost: t.procedure
		.use(logger)
		.use(authenticated)
		.use(developer)
		.input(safePostRequest)
		.mutation(({ input }) => takeDownPost(input))
});

import { db } from '$lib/server/db';
import { posts, reports } from '$lib/server/db/schema';
import { sendTRPCResponse } from '$lib/utils';
import { eq } from 'drizzle-orm';
import type {
	getReportMessageRequest,
	safePostRequest,
	takeDownPostRequest
} from '../schema/reportSchema';
import * as m from '$lib/paraglide/messages.js';
import { z } from 'zod';

export const getReportMessage = async (input: z.infer<typeof getReportMessageRequest>) => {
	const { postId } = input;

	const reportMessages = await db
		.select({
			id: reports.id,
			message: reports.reason
		})
		.from(reports)
		.where(eq(reports.postId, postId));

	return sendTRPCResponse(
		{
			status: reportMessages.length > 0 ? 200 : 404,
			message: 'ok'
		},
		reportMessages
	);
};

export const safePost = async (input: z.infer<typeof safePostRequest>) => {
	const { postId } = input;

	const response = await db
		.delete(reports)
		.where(eq(reports.postId, postId))
		.then(() => sendTRPCResponse({ status: 200, message: 'Deleted!' }))
		.catch(() => sendTRPCResponse({ status: 500, message: m.global_error_message() }));

	return response;
};

export const takeDownPost = async (input: z.infer<typeof takeDownPostRequest>) => {
	const { postId } = input;

	try {
		const trpcResponse = await db.transaction(async (tx) => {
			await tx.delete(reports).where(eq(reports.postId, postId));
			await tx.delete(posts).where(eq(posts.id, postId));

			return sendTRPCResponse({
				status: 201,
				message: 'Deleted!'
			});
		});

		return trpcResponse;
	} catch (error) {
		console.error('Transaction failed:', error);

		return sendTRPCResponse({
			status: 500,
			message: m.global_error_message()
		});
	}
};

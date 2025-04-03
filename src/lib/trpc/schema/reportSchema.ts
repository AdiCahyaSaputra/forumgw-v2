import { z } from 'zod';

export const getReportMessageRequest = z.object({
	postId: z.string()
});

export const safePostRequest = z.object({
	postId: z.string()
});

export const takeDownPostRequest = z.object({
	postId: z.string()
});
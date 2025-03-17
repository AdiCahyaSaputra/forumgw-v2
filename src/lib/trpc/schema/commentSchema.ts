import * as m from '$lib/paraglide/messages.js';
import { z } from 'zod';

export const commentRequest = () =>
	z.object({
		text: z
			.string()
			.min(1, m.validation_min({ field: 'text', length: 1 }))
			.max(255, m.validation_max({ field: 'text', length: 255 })),
		postId: z.string(),
		mentionUsers: z.string().optional(),
		groupId: z.string().optional()
	});

export const replyCommentRequest = () =>
	z.object({
		text: z
			.string()
			.min(1, m.validation_min({ field: 'text', length: 1 }))
			.max(255, m.validation_max({ field: 'text', length: 255 })),
		commentId: z.number(),
		mentionUsers: z.string().optional(),
		groupId: z.string().optional()
	});

export const getPostCommentsRequest = z.object({
	postId: z.string(),
	cursor: z.number().optional()
});

export const getReplyCommentsRequest = z.object({
	commentId: z.number(),
	cursor: z.number().optional()
});

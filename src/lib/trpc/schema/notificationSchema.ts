import { z } from 'zod';

export const markAsReadedRequest = z.object({
	notificationId: z.string().optional()
});

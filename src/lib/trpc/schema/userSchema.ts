import { z } from 'zod';

export const getUserForMentioningRequest = z.object({
  username: z.string(),
  groupId: z.string().optional(),
});
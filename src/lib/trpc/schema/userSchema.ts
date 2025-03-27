import { z } from 'zod';

export const getUserForMentioningRequest = z.object({
  username: z.string(),
  groupId: z.string().optional(),
});

export const getUserForInviteRequest = z.object({
  username: z.string().optional(),
});
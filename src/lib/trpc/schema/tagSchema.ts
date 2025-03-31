import { z } from 'zod';

export const getAllTagsRequest = z.object({
  onlyCurrentUser: z.boolean().optional().default(false),
  groupId: z.string().optional(),
  cursor: z.number().optional(),
  name: z.string().optional(),
});

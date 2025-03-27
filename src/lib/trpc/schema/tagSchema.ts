import { z } from 'zod';

export const getAllTagsRequest = z.object({
  groupId: z.string().optional(),
  cursor: z.number().optional(),
  name: z.string().optional(),
});

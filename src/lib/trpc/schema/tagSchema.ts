import { z } from 'zod';

export const getAllTagsRequest = z.object({
  cursor: z.number().optional(),
  name: z.string().optional(),
});

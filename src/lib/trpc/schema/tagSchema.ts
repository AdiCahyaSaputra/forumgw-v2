import { z } from 'zod';

export const getAllTagsRequest = z.object({
  cursor: z.number().nullable()
});

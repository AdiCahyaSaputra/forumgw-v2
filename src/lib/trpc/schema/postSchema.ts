import { z } from 'zod';

export const getPublicPostDiscussionsRequest = () =>
  z.object({
    tagIds: z.array(z.number()).default([])
  });

export const reportPostRequest = z.object({
  reason: z.string().optional().default('-'),
  id: z.string(),
});

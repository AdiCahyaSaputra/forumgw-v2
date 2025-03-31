import * as m from '$lib/paraglide/messages.js';
import { z } from 'zod';

export const getPublicPostDiscussionsRequest = () =>
  z.object({
    groupId: z.string().optional(),
    onlyCurrentUser: z.boolean().optional().default(false),
    tagIds: z.array(z.number()).default([]),
    cursor: z.string().optional()
  });

export const getPostDetailRequest = z.object({
  id: z.string()
});

export const createPostRequest = () =>
  z.object({
    groupId: z.string().optional(),
    tags: z.array(z.string()).default([]),
    isAnonymous: z.boolean().default(false),
    content: z
      .string()
      .min(1, m.validation_min({ length: 1, field: 'content' }))
      .max(255, m.validation_max({ length: 20, field: 'content' }))
  });

export const editPostRequest = () =>
  z.object({
    postId: z.string(),
    groupId: z.string().optional(),
    tags: z.array(z.string()).default([]),
    isAnonymous: z.boolean().default(false),
    content: z
      .string()
      .min(1, m.validation_min({ length: 1, field: 'content' }))
      .max(255, m.validation_max({ length: 20, field: 'content' }))
  });

export const deletePostRequest = z.object({
  postId: z.string(),
  groupId: z.string().optional()
});

export const reportPostRequest = z.object({
  reason: z.string().optional().default('-'),
  id: z.string()
});

import { z } from 'zod';
import type { UserPayload } from '../services/user';
import * as m from '$lib/paraglide/messages.js';

export const getUserForMentioningRequest = z.object({
  username: z.string(),
  groupId: z.string().optional()
});

export const getUserForInviteRequest = z.object({
  username: z.string().optional()
});

export const editUserRequest = (
  user: UserPayload | null
) =>
  z.object({
    name: z
      .string()
      .min(5, m.validation_min({ length: 5, field: 'name' }))
      .max(20, m.validation_max({ length: 20, field: 'name' }))
      .default(user ? user.name : ''),
    username: z
      .string()
      .min(5, m.validation_min({ length: 5, field: 'username' }))
      .max(20, m.validation_max({ length: 20, field: 'username' }))
      .default(user ? user.username : ''),
    bio: z
      .string()
      .nullable()
      .optional()
      .default(user ? (user.bio ?? '') : ''),
    avatar: z
      .string()
      .nullable()
      .optional()
      .default(user ? (user.image ?? '') : ''),
  });

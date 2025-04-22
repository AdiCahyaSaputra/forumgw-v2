import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const registerSchema = () =>
  z.object({
    name: z
      .string()
      .min(5, m.validation_min({ length: 5, field: 'name' }))
      .max(20, m.validation_max({ length: 20, field: 'name' })),
    username: z
      .string()
      .min(5, m.validation_min({ length: 5, field: 'username' }))
      .max(20, m.validation_max({ length: 20, field: 'username' })),
    password: z
      .string()
      .min(8, m.validation_min({ length: 8, field: 'password' }))
      .max(255, m.validation_max({ length: 255, field: 'password' }))
  });

export type RegisterSchema = ReturnType<typeof registerSchema>;

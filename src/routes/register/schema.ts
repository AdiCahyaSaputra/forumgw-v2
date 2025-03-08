import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(5).max(20),
  username: z.string().min(5).max(20),
  password: z.string().min(8).max(10)
});

export type FormSchema = typeof registerSchema;

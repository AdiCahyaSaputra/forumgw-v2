import { z } from 'zod';
import * as m from '$lib/paraglide/messages.js';

export const loginSchema = () =>
	z.object({
		username: z
			.string()
			.min(5, m.validation_min({ length: 5, field: 'username' }))
			.max(20, m.validation_max({ length: 20, field: 'username' })),
		password: z
			.string()
			.min(8, m.validation_min({ length: 8, field: 'password' }))
			.max(255, m.validation_max({ length: 255, field: 'password' }))
	});

export type LoginSchema = ReturnType<typeof loginSchema>;

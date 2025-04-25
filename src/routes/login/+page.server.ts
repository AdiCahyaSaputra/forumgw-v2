import type { PageServerLoad } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { loginSchema } from '$lib/trpc/schema/loginSchema.js';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ depends }) => {
	depends('paraglide:lang');

	return {
		form: await superValidate(zod(loginSchema()))
	};
};

import type { PageServerLoad } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { registerSchema } from '$lib/trpc/schema/registerSchema.js';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ depends }) => {
  depends('paraglide:lang');

  return {
    form: await superValidate(zod(registerSchema()))
  };
};

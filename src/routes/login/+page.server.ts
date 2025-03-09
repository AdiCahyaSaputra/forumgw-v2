import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { loginSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ depends }) => {
  depends('paraglide:lang');

  return {
    form: await superValidate(zod(loginSchema()))
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(loginSchema()));

    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    return {
      form
    };
  }
};

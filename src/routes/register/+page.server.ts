import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { registerSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ depends }) => {
  depends('paraglide:lang');

  return {
    form: await superValidate(zod(registerSchema()))
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(registerSchema()));

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

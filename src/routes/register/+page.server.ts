import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { registerSchema } from '$lib/trpc/schema/registerSchema.js';
import { zod } from 'sveltekit-superforms/adapters';
import { registeringNewUser } from '$lib/trpc/services/user.js';

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

    const response = await registeringNewUser(form.data);

    if (response.status !== 201) {
      return fail(response.status, {
        form,
        message: response.message
      });
    }

    return {
      form,
      ...response
    };
  }
};

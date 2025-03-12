import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { loginSchema } from '$lib/trpc/schema/loginSchema.js';
import { zod } from 'sveltekit-superforms/adapters';
import { authenticateUser } from '$lib/trpc/services/user.js';

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

    const response = await authenticateUser(form.data);

    if (!response.data || response.status !== 200) {
      return fail(response.status, {
        form,
        message: response.message
      });
    }

    event.cookies.set('TOKEN', response.data.token, {
      expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
      path: '/'
    });

    event.cookies.set('REFRESH_TOKEN', response.data.refreshToken, {
      expires: new Date(Date.now() + 24 * (60 * 60 * 1000)),
      path: '/'
    });

    return {
      form,
      ...response
    };
  }
};

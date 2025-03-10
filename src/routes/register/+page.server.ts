import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { registerSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import * as m from '$lib/paraglide/messages.js';

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

    const { name, username, password } = form.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.insert(users)
      .values({
        name,
        username,
        password: hashedPassword
      })
      .catch(() =>
        fail(400, {
          form,
          message: m.global_error_message()
        })
      );

    return {
      form,
      message: 'ok'
    };
  }
};

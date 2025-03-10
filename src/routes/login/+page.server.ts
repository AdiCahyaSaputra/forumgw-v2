import type { Actions, PageServerLoad } from './$types.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { loginSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as m from '$lib/paraglide/messages.js';
import { createJWT } from '$lib/trpc/services/user.js';

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

    const { username, password } = form.data;

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return fail(404, {
        form,
        message: m.login_message_user_not_exists()
      });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return fail(401, {
        form,
        message: m.login_message_mismatch_credentials()
      });
    }

    const { token, refreshToken } = await createJWT(user.id);

    if (!token && !refreshToken) {
      return fail(401, {
        form,
        message: m.login_message_session_error()
      });
    }

    event.cookies.set('TOKEN', token, {
      expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
      path: '/'
    });

    event.cookies.set('REFRESH_TOKEN', token, {
      expires: new Date(Date.now() + 24 * (60 * 60 * 1000)),
      path: '/'
    });

    return {
      form,
      message: 'ok'
    };
  }
};

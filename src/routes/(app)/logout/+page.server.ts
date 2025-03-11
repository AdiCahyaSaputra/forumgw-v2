import { db } from '$lib/server/db';
import { jwts } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

export const actions: Actions = {
  default: async (event) => {
    db.update(jwts)
      .set({
        expiredIn: new Date(Date.now())
      })
      .catch(() =>
        fail(400, {
          message: m.global_error_message()
        })
      );

    event.cookies.delete('TOKEN', { path: '/' });
    event.cookies.delete('REFRESH_TOKEN', { path: '/' });

    return {
      message: 'ok'
    };
  }
};

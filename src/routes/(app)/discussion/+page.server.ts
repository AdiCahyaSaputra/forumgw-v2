import { db } from '$lib/server/db';
import { jwts } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { sendTRPCResponse } from '$lib/utils';
import { reportPost } from '$lib/trpc/services/post';

export const load: PageServerLoad = async (event) => {
  return {
    publicPostDiscussions: await createCaller(
      await createContext(event)
    ).post.getPublicPostDiscussions({ tagIds: [] })
  };
};

export const actions: Actions = {
  logout: async (event) => {
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
  },
  reportPost: async (event) => {
    const form = await event.request.formData();

    const id = form.get('id')?.toString();
    const reason = form.get('reason')?.toString() ?? '-';

    if (id) {
      const response = await reportPost({
        id,
        reason: reason || '-'
      });

      if (response.status === 500) {
        fail(response.status, response);
      }

      return response;
    } else {
      return fail(404, {
        message: m.post_report_error_not_found_id()
      });
    }
  },
  createNewPost: async (event) => {
    const form = await event.request.formData();
  }
};

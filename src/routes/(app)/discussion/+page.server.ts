import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { jwts } from '$lib/server/db/schema';
import { createPostRequest } from '$lib/trpc/schema/postSchema';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		formCreate: await superValidate(zod(createPostRequest()))
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
};

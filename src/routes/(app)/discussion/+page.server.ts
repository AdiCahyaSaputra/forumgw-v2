import * as m from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { jwts } from '$lib/server/db/schema';
import { createPostRequest } from '$lib/trpc/schema/postSchema';
import { createNewPost, reportPost } from '$lib/trpc/services/post';
import { verifyUserToken } from '$lib/trpc/services/user';
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
		const form = await superValidate(event, zod(createPostRequest()));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const payload = await verifyUserToken(event);

		if (payload.user === null) {
			return fail(401, {
				form
			});
		}

		const { status, message } = await createNewPost(form.data, payload.user?.id);

		if (status !== 201) {
			return fail(status, {
				form,
				message
			});
		}

		return {
			form,
			message
		};
	}
};

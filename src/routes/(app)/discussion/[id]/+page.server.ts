import { commentRequest, replyCommentRequest } from '$lib/trpc/schema/commentSchema';
import { createComment, replyComment } from '$lib/trpc/services/comment';
import { verifyUserToken } from '$lib/trpc/services/user';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return {
		formComment: await superValidate(zod(commentRequest())),
		formReplyComment: await superValidate(zod(replyCommentRequest())),
		params: event.params,
		user: (await event.parent()).user
	};
};

export const actions: Actions = {
	createComment: async (event) => {
		const form = await superValidate(event, zod(commentRequest()));

		if (!form.valid) {
			console.log(form.errors);

			return fail(400, {
				form
			});
		}

		const { user } = await verifyUserToken(event);

		if (!user) {
			return fail(401, {
				form,
				message: 'Unauthorized'
			});
		}

		const response = await createComment(form.data, user);

		if (response.status !== 201) {
			const { status, message } = response;

			return fail(status, {
				form,
				message
			});
		}

		return {
			form
		};
	},
	replyComment: async (event) => {
		const form = await superValidate(event, zod(replyCommentRequest()));

		if (!form.valid) {
			console.log(form.errors);

			return fail(400, {
				form
			});
		}

		const { user } = await verifyUserToken(event);

		if (!user) {
			return fail(401, {
				form,
				message: 'Unauthorized'
			});
		}

		const response = await replyComment(form.data, user);

		if (response.status !== 201) {
			const { status, message } = response;

			return fail(status, {
				form,
				message
			});
		}

		return {
			form
		};
	}
};

import { createPostRequest } from '$lib/trpc/schema/postSchema';
import { type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { invalidateAllAuthSession } from '$lib/trpc/services/auth';
import { verifyUserToken } from '$lib/trpc/services/user';

export const load: PageServerLoad = async () => {
	return {
		formCreate: await superValidate(zod(createPostRequest()))
	};
};

export const actions: Actions = {
	logout: async (event) => {
		const { user } = await verifyUserToken(event);

		if (user) {
			event.cookies.delete('TOKEN', { path: '/' });

			await invalidateAllAuthSession(user.id);
		}

		return {
			message: 'ok'
		};
	}
};

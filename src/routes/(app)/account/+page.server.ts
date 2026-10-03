import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { changePasswordRequest, editUserRequest } from '$lib/trpc/schema/userSchema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const parent = await event.parent();

	return {
		formEdit: await superValidate(
			zod(editUserRequest({ ...parent.user!, avatar: parent.user!.image }))
		),
		formChangePassword: await superValidate(zod(changePasswordRequest)),
		user: parent.user
	};
};

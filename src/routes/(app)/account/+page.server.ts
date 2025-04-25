import { editUserRequest } from '$lib/trpc/schema/userSchema';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
	const parent = await event.parent();

	return {
		formEdit: await superValidate(zod(editUserRequest(parent.user!))),
		user: parent.user
	};
};

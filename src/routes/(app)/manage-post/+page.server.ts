import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { editPostRequest } from '$lib/trpc/schema/postSchema';

export const load: PageServerLoad = async () => {
	return {
		formEdit: await superValidate(zod(editPostRequest()))
	};
};

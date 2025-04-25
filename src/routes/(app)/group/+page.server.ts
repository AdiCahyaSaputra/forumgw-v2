import { createGroupRequest } from '$lib/trpc/schema/groupSchema';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	return {
		formCreate: await superValidate(zod(createGroupRequest()))
	};
};

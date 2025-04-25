import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return {
		params: event.params
	};
};

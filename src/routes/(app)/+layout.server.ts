import { verifyUserToken } from '$lib/trpc/services/user';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { user } = await verifyUserToken(event);

	return {
		user
	};
};

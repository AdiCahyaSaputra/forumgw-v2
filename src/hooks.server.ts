import { redirect, type Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { createTRPCHandle } from 'trpc-sveltekit';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { verifyUserToken } from '$lib/trpc/services/user';

const protectedRoutes: string[] = [
	'/account',
	'/discussion',
	'/group',
	'/manage-group',
	'/manage-post',
	'/notification',
	'/profile',
	'/reported-post'
];

const guestRoutes: string[] = ['/login', '/register'];
const maintenanceRoutes: string[] = ['/group', '/manage-group'];
const devRoutes: string[] = ['/reported-post'];

const startWithUrls = (urlArray: string[], pathname: string, callback: () => void) => {
	for (const url of urlArray) {
		if (pathname.startsWith(url)) {
			return callback();
		}
	}
};

const handleParaglide: Handle = i18n.handle();
const handleTRPC: Handle = createTRPCHandle({ router, createContext });

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	console.log(pathname);

	if (pathname === '/') throw redirect(303, '/login');

	startWithUrls(maintenanceRoutes, pathname, () => {
		throw redirect(303, '/maintenance');
	});

	const { user } = await verifyUserToken(event);

	startWithUrls(devRoutes, pathname, () => {
		if (user && user.role !== 'developer') {
			throw redirect(303, '/discussion');
		}
	});

	startWithUrls(protectedRoutes, pathname, () => {
		if (!user) {
			// Make sure the cookies are deleted
			event.cookies.delete('TOKEN', { path: '/' });

			throw redirect(303, '/login');
		}
	});

	startWithUrls(guestRoutes, pathname, () => {
		if (user) {
			throw redirect(303, '/discussion');
		}
	});

	return handleParaglide({
		event,
		resolve: (event) => handleTRPC({ event, resolve })
	});
};

// import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { verifyUserToken } from './services/user';
import { setLanguageTag } from '$lib/paraglide/runtime';

type SupportedLanguage = 'en' | 'id';

// Helper function to validate language
function isValidLanguage(lang: string): lang is SupportedLanguage {
	return ['en', 'id'].includes(lang);
}

export async function createContext(event: RequestEvent) {
	try {
		const userContextPayload = await verifyUserToken(event);
		const requestedLang =
			event.request.headers.get('x-language') ||
			event.request.headers.get('accept-language') ||
			'en';

		const lang = isValidLanguage(requestedLang) ? requestedLang : 'en';

		setLanguageTag(lang);

		return {
			user: userContextPayload.user,
			event
		};
	} catch (e) {
		console.log('Context Error: ', e);

		return { user: null, event };
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>;

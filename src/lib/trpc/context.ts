// import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { verifyUserToken } from './services/user';
import { setLanguageTag } from '$lib/paraglide/runtime';
import { getBaseUrl } from '$lib/utils';
import { TRPCError } from '@trpc/server';

type SupportedLanguage = 'en' | 'id';

// Helper function to validate language
function isValidLanguage(lang: string): lang is SupportedLanguage {
  return ['en', 'id'].includes(lang);
}

export async function createContext(event: RequestEvent) {
  try {
    // CSRF Protection
    if(event.request.method !== 'GET') {
      const origin = event.request.headers.get('Origin');

      if(origin === null || origin !== getBaseUrl()) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
    }

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
  } catch {
    return { user: null, event };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;

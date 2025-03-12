// import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { verifyUserToken } from './services/user';

export async function createContext(event: RequestEvent) {
  try {
    const payload = await verifyUserToken(event);

    return payload;
  } catch {
    return { user: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;

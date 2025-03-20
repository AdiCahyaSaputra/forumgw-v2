import type { UserPayload } from "./trpc/services/user";
import type { RequestEvent } from '@sveltejs/kit';

export type ctxType = {
  user: UserPayload | null;
  event: RequestEvent<Partial<Record<string, string>>, string | null>;
};

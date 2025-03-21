import type { UserPayload } from './trpc/services/user';
import type { RequestEvent } from '@sveltejs/kit';

export type CtxType = {
  user: UserPayload | null;
  event: RequestEvent<Partial<Record<string, string>>, string | null>;
};

export type SelectedTag = {
  id: number;
  name: string;
  _count: {
    post: number;
  };
};

import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { user } from './routes/user';
import { post } from './routes/post';
import { tag } from './routes/tag';

export const router = t.router({
  user,
  post,
  tag
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;

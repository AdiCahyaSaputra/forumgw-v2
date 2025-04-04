import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { comment } from './routes/comment';
import { post } from './routes/post';
import { tag } from './routes/tag';
import { user } from './routes/user';
import { group } from './routes/group';
import { report } from './routes/report';
import { notification } from './routes/notifications';

export const router = t.router({
	user,
	post,
	tag,
	comment,
  group,
	report,
  notification
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;

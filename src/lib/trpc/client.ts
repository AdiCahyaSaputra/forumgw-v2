import { svelteQueryWrapper } from 'trpc-svelte-query-adapter';
import type { QueryClient } from '@tanstack/svelte-query';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';
import type { Router } from './router';
import transformer from 'trpc-transformer';
import { languageTag } from '$lib/paraglide/runtime';

let browserClient: ReturnType<typeof svelteQueryWrapper<Router>>;

export function trpc(init?: TRPCClientInit, queryClient?: QueryClient) {
	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && browserClient) return browserClient;

	const client = svelteQueryWrapper<Router>({
		client: createTRPCClient<Router>({
			init,
			transformer,
			headers() {
				return {
					'x-language': languageTag()
				};
			}
		}),
		queryClient
	});

	if (isBrowser) browserClient = client;

	return client;
}

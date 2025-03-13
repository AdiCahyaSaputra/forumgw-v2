import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { createTRPCHandle } from 'trpc-sveltekit';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';

const handleParaglide: Handle = i18n.handle();
const handleTRPC: Handle = createTRPCHandle({ router, createContext });

export const handle: Handle = ({ event, resolve }) => {
  return handleParaglide({
    event,
    resolve: (event) => handleTRPC({ event, resolve })
  });
};

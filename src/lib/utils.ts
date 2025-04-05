import * as m from '$lib/paraglide/messages.js';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TRPCClientInit } from 'trpc-sveltekit';
import { trpc } from './trpc/client';
import type { OurFileRouter } from '$lib/server/uploadthing';
import { generateSvelteHelpers } from '@uploadthing/svelte';
import filter from 'leo-profanity';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function sendTRPCResponse<T = void>(
	baseResponse: { status: number; message: string },
	data: T | undefined = undefined
) {
	return {
		...baseResponse,
		data: data as T
	};
}

export const getBaseUrl = () => {
	if (typeof window !== 'undefined')
		// browser should use relative path
		return '';
	if (process.env.VERCEL_URL)
		// reference for vercel.com
		return `https://${process.env.VERCEL_URL}`;
	if (process.env.RENDER_INTERNAL_HOSTNAME)
		// reference for render.com
		return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
	// assume localhost
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpcClientUtils = (init?: TRPCClientInit) => trpc(init).createUtils();

export const timeAgo = (date: Date): string => {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals: { [key: string]: number } = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
		second: 1
	};

	const unitLang: Record<keyof typeof intervals, string> = {
		year: m.year(),
		month: m.month(),
		week: m.week(),
		day: m.day(),
		hour: m.hour(),
		minute: m.minute(),
		second: m.second()
	};

	for (const [unitKey, secondsInUnit] of Object.entries(intervals)) {
		const count = Math.floor(seconds / secondsInUnit);
		if (count >= 1) {
			return `${count} ${unitLang[unitKey]}${count !== 1 ? m.time_plural() : ''} ${m.ago()}`;
		}
	}

	return m.just_now();
};

export function debounce<T extends () => void>(func: T, wait: number): () => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (): void {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			func();
			timeout = null;
		}, wait);
	};
}

export const { createUploader, createUploadThing } = generateSvelteHelpers<OurFileRouter>();

export const BadWordFilter = (str: string) => {
	filter.add([
		'anjing',
		'babi',
		'kunyuk',
		'bajingan',
		'ajg',
		'anjg',
		'anj',
		'mmk',
		'kntl',
		'bgst',
		'ppk',
		'asu',
		'bangsat',
		'kampret',
		'kontol',
		'memek',
		'ngentot',
		'pentil',
		'perek',
		'pepek',
		'pecun',
		'bencong',
		'banci',
		'maho',
		'gila',
		'sinting',
		'tolol',
		'sarap',
		'setan',
		'lonte',
		'hencet',
		'taptei',
		'kampang',
		'pilat',
		'keparat',
		'bejad',
		'gembel',
		'brengsek',
		'tai',
		'anjrit',
		'bangsat',
		'fuck',
		'tetek',
		'ngulum',
		'jembut',
		'totong',
		'kolop',
		'pukimak',
		'bodat',
		'heang',
		'jancuk',
		'burit',
		'titit',
		'nenen',
		'bejat',
		'silit',
		'sempak',
		'fucking',
		'asshole',
		'bitch',
		'penis',
		'vagina',
		'klitoris',
		'kelentit',
		'borjong',
		'dancuk',
		'pantek',
		'taek',
		'itil',
		'teho',
		'bejat',
		'pantat',
		'bagudung',
		'babami',
		'kanciang',
		'bungul',
		'idiot',
		'kimak',
		'henceut',
		'kacuk',
		'blowjob',
		'pussy',
		'dick',
		'damn',
		'ass'
	]);

	return filter.clean(str, '0');
};

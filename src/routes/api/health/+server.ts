import { json } from '@sveltejs/kit';
import { client } from '$lib/server/db';

export async function GET() {
	try {
		await client`select 1`;
		return json({ status: 'ok' });
	} catch {
		return json({ status: 'unavailable' }, { status: 503 });
	}
}

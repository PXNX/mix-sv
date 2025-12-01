// @ts-nocheck
// src/routes/favorites/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources } from '$lib/server/schema';
import { inArray } from 'drizzle-orm';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
	const idsParam = url.searchParams.get('ids');

	if (!idsParam) {
		return {
			channels: []
		};
	}

	try {
		const ids = idsParam
			.split(',')
			.map((id: string) => parseInt(id))
			.filter((id: number) => !isNaN(id));

		if (ids.length === 0) {
			return {
				channels: []
			};
		}

		const channels = await db
			.select({
				channel_id: sources.channel_id,
				channel_name: sources.channel_name,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite,
				avatar: sources.avatar
			})
			.from(sources)
			.where(inArray(sources.channel_id, ids));

		return {
			channels
		};
	} catch (err) {
		console.error('Error fetching favorite channels:', err);
		return {
			channels: []
		};
	}
};

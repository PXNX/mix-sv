// src/routes/channel/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid channel ID');
	}

	try {
		const result = await db
			.select({
				channel_id: sources.channel_id,
				channel_name: sources.channel_name,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite
			})
			.from(sources)
			.where(eq(sources.channel_id, id))
			.limit(1);

		const channel = result[0];

		if (!channel) {
			throw error(404, 'Channel not found');
		}

		return {
			channel
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error fetching channel:', err);
		throw error(500, 'Failed to fetch channel');
	}
};

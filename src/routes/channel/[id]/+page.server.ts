// src/routes/channel/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources, files } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getSignedDownloadUrl } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid channel ID');
	}

	try {
		// Query with left join to get file key if avatar exists
		const result = await db
			.select({
				channelId: sources.channelId,
				channelName: sources.channelName,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite,
				avatarFileId: sources.avatar,
				avatarKey: files.key
			})
			.from(sources)
			.leftJoin(files, eq(sources.avatar, files.id))
			.where(eq(sources.channelId, id))
			.limit(1);

		const channel = result[0];

		if (!channel) {
			throw error(404, 'Channel not found');
		}

		// Generate signed URL if avatar exists
		let avatarUrl: string | null = null;
		if (channel.avatarKey) {
			try {
				avatarUrl = await getSignedDownloadUrl(channel.avatarKey);
			} catch (err) {
				console.error('Failed to generate avatar URL:', err);
				// Continue without avatar if URL generation fails
			}
		}

		return {
			channel: {
				channelId: channel.channelId,
				channelName: channel.channelName,
				username: channel.username,
				bias: channel.bias,
				invite: channel.invite,
				avatar: avatarUrl // Now returns the signed URL
			}
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error fetching channel:', err);
		throw error(500, 'Failed to fetch channel');
	}
};

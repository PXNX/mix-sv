// src/routes/channel/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources, destinations, accounts } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getAvatarUrlsByFileIds } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid channel ID');
	}

	try {
		const result = await db
			.select({
				channelId: sources.channelId,
				channelName: sources.channelName,
				displayName: sources.displayName,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite,
				description: sources.description,
				rating: sources.rating,
				isActive: sources.isActive,
				isSpread: sources.isSpread,
				avatarFileId: sources.avatar,
				destinationName: destinations.name,
				accountName: accounts.name
			})
			.from(sources)
			.leftJoin(destinations, eq(sources.destination, destinations.channelId))
			.leftJoin(accounts, eq(sources.apiId, accounts.accountId))
			.where(eq(sources.channelId, id))
			.limit(1);

		const channel = result[0];

		if (!channel) {
			throw error(404, 'Channel not found');
		}

		// Generate signed URL if avatar exists
		const avatarUrls = await getAvatarUrlsByFileIds([channel.avatarFileId]);
		const avatarUrl = channel.avatarFileId ? (avatarUrls.get(channel.avatarFileId) ?? null) : null;

		return {
			channel: {
				channelId: channel.channelId,
				channelName: channel.channelName,
				displayName: channel.displayName || channel.channelName,
				username: channel.username,
				bias: channel.bias,
				invite: channel.invite,
				description: channel.description,
				rating: channel.rating,
				isActive: channel.isActive,
				isSpread: channel.isSpread,
				avatar: avatarUrl, // Now returns the signed URL
				destinationName: channel.destinationName,
				accountName: channel.accountName
			},
			// Extended fields are only relevant to admins reviewing/managing sources
			isAdmin: locals.user?.isAdmin ?? false
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error fetching channel:', err);
		throw error(500, 'Failed to fetch channel');
	}
};

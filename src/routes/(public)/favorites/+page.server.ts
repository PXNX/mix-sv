// src/routes/favorites/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources } from '$lib/server/schema';
import { inArray } from 'drizzle-orm';
import { getAvatarUrlsByFileIds } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ url }) => {
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

		const results = await db
			.select({
				channelId: sources.channelId,
				channelName: sources.channelName,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite,
				avatarFileId: sources.avatar
			})
			.from(sources)
			.where(inArray(sources.channelId, ids))
			.orderBy(sources.channelName);

		const avatarUrls = await getAvatarUrlsByFileIds(results.map((r) => r.avatarFileId));

		const channelsWithAvatars = results.map((channel) => ({
			channelId: channel.channelId,
			channelName: channel.channelName,
			username: channel.username,
			bias: channel.bias,
			invite: channel.invite,
			avatar: channel.avatarFileId ? (avatarUrls.get(channel.avatarFileId) ?? null) : null
		}));

		return {
			channels: channelsWithAvatars
		};
	} catch (err) {
		console.error('Error fetching favorite channels:', err);
		return {
			channels: []
		};
	}
};

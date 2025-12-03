// src/routes/favorites/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sources, files } from '$lib/server/schema';
import { inArray, eq } from 'drizzle-orm';
import { getSignedDownloadUrl } from '$lib/server/backblaze';

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

		// Query with left join to get file keys (matching search page)
		const results = await db
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
			.where(inArray(sources.channelId, ids))
			.orderBy(sources.channelName);

		// Generate signed URLs for avatars
		const channelsWithAvatars = await Promise.all(
			results.map(async (channel) => {
				let avatarUrl: string | null = null;

				if (channel.avatarKey) {
					try {
						avatarUrl = await getSignedDownloadUrl(channel.avatarKey);
					} catch (err) {
						console.error(`Failed to generate avatar URL for channel ${channel.channelId}:`, err);
						// Continue without avatar if URL generation fails
					}
				}

				return {
					channelId: channel.channelId,
					channelName: channel.channelName,
					username: channel.username,
					bias: channel.bias,
					invite: channel.invite,
					avatar: avatarUrl
				};
			})
		);

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

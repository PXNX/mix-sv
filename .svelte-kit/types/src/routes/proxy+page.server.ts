// @ts-nocheck
// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { sources, files } from '$lib/server/schema';
import { ilike, eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { SQL } from 'drizzle-orm';
import { getSignedDownloadUrl } from '$lib/server/backblaze';

async function getChannelsWithAvatars(conditions: SQL[]) {
	// Query with left join to get file keys
	let query = db
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
		.leftJoin(files, eq(sources.avatar, files.id));

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const results = await query.orderBy(sources.channelName);

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

	return channelsWithAvatars;
}

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
	const name = url.searchParams.get('name') || undefined;
	const bias = url.searchParams.get('bias') || undefined;

	try {
		const conditions: SQL[] = [];

		if (name) {
			conditions.push(ilike(sources.channelName, `%${name}%`));
		}

		if (bias) {
			conditions.push(eq(sources.bias, bias));
		}

		const channels = await getChannelsWithAvatars(conditions);

		return {
			channels,
			user: locals.user,
			session: locals.session
		};
	} catch (err) {
		console.error('Error loading channels:', err);
		throw error(500, {
			message: 'Failed to load channels. Please try again later.'
		});
	}
};

export const actions = {
	search: async ({ request }: import('./$types').RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name')?.toString() || undefined;
		const bias = data.get('bias')?.toString() || undefined;

		try {
			const conditions: SQL[] = [];

			if (name) {
				conditions.push(ilike(sources.channelName, `%${name}%`));
			}

			if (bias) {
				conditions.push(eq(sources.bias, bias));
			}

			const channels = await getChannelsWithAvatars(conditions);

			return {
				success: true,
				channels
			};
		} catch (err) {
			console.error('Search failed:', err);
			return {
				success: false,
				error: 'Search failed. Please try again later.'
			};
		}
	}
};
;null as any as Actions;
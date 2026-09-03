// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { sources } from '$lib/server/schema';
import { ilike, eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { SQL } from 'drizzle-orm';
import { getAvatarUrlsByChannelIds } from '$lib/server/backblaze';

async function getChannelsWithAvatars(conditions: SQL[]) {
	// sources lives in ptb_nn; avatars are tracked separately in mix-sv's own
	// database (see channelAvatars in app-schema.ts), so resolve them after.
	let query = db
		.select({
			channelId: sources.channelId,
			channelName: sources.channelName,
			displayName: sources.displayName,
			username: sources.username,
			bias: sources.bias,
			invite: sources.invite
		})
		.from(sources);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const results = await query.orderBy(sources.channelName);
	const avatarUrls = await getAvatarUrlsByChannelIds(results.map((r) => r.channelId));

	return results.map((channel) => ({
		channelId: channel.channelId,
		channelName: channel.channelName,
		displayName: channel.displayName || channel.channelName,
		username: channel.username,
		bias: channel.bias,
		invite: channel.invite,
		avatar: avatarUrls.get(channel.channelId) ?? null
	}));
}

export const load: PageServerLoad = async ({ url, locals }) => {
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

export const actions: Actions = {
	search: async ({ request }) => {
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

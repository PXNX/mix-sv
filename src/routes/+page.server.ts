// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { sources } from '$lib/server/schema';
import { ilike, eq, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const name = url.searchParams.get('name') || undefined;
	const bias = url.searchParams.get('bias') || undefined;

	try {
		const conditions: SQL[] = [];

		if (name) {
			conditions.push(ilike(sources.channel_name, `%${name}%`));
		}

		if (bias) {
			conditions.push(eq(sources.bias, bias));
		}

		let query = db
			.select({
				channel_id: sources.channel_id,
				channel_name: sources.channel_name,
				username: sources.username,
				bias: sources.bias,
				invite: sources.invite
			})
			.from(sources);

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const channels = await query.orderBy(sources.channel_name);

		return {
			channels
		};
	} catch (error) {
		console.error('Error loading channels:', error);
		return {
			channels: []
		};
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
				conditions.push(ilike(sources.channel_name, `%${name}%`));
			}

			if (bias) {
				conditions.push(eq(sources.bias, bias));
			}

			let query = db
				.select({
					channel_id: sources.channel_id,
					channel_name: sources.channel_name,
					username: sources.username,
					bias: sources.bias,
					invite: sources.invite
				})
				.from(sources);

			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}

			const channels = await query.orderBy(sources.channel_name);

			return {
				success: true,
				channels
			};
		} catch (error) {
			console.error('Search failed:', error);
			return {
				success: false,
				channels: [],
				error: 'Search failed. Please try again.'
			};
		}
	}
};

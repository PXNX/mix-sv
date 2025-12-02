// @ts-nocheck
// src/routes/channel/new/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pendingCreations, sources, bloats } from '$lib/server/schema';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { channelSchema } from './schema';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	const form = await superValidate(valibot(channelSchema));
	return {
		form,
		isAdmin: locals.user?.isAdmin || false
	};
};

export const actions = {
	create: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, valibot(channelSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { channelId, channelName, username, bias, invite, bloats: bloatPatterns } = form.data;

		// Clean username (remove @ if present) - make it null if empty
		const cleanUsername =
			username && username.trim() !== ''
				? username.startsWith('@')
					? username.slice(1)
					: username
				: null;

		// Process invite link if provided
		let inviteHash: string | null = null;
		if (invite && invite.trim() !== '') {
			// Extract hash from full invite link or use as-is
			const inviteMatch = invite.match(/t\.me\/\+([A-Za-z0-9_-]+)/);
			if (inviteMatch) {
				inviteHash = inviteMatch[1];
			} else if (invite.startsWith('+')) {
				inviteHash = invite.slice(1);
			} else {
				inviteHash = invite;
			}
		}

		// Parse channel ID to number
		const channelIdNum = parseInt(channelId, 10);

		try {
			// Check if channel ID already exists
			const existingChannel = await db.query.sources.findFirst({
				where: eq(sources.channel_id, channelIdNum)
			});

			if (existingChannel) {
				return fail(400, {
					form,
					error: 'A channel with this ID already exists.'
				});
			}

			// If admin, create channel directly
			if (locals.user.isAdmin) {
				await db.insert(sources).values({
					channel_id: channelIdNum,
					channel_name: channelName,
					username: cleanUsername,
					bias,
					invite: inviteHash
				});

				// Insert bloats if any
				if (bloatPatterns && bloatPatterns.length > 0) {
					await db.insert(bloats).values(
						bloatPatterns.map((pattern) => ({
							channel_id: channelIdNum,
							pattern
						}))
					);
				}

				return {
					form,
					success: true,
					message: 'Channel created successfully!'
				};
			}

			// Non-admin: Insert pending creation for review
			const bloatsJson = JSON.stringify(bloatPatterns || []);

			await db.insert(pendingCreations).values({
				userId: locals.user.id,
				channelId: channelIdNum,
				channelName,
				username: cleanUsername,
				bias,
				invite: inviteHash,
				bloats: bloatsJson,
				status: 'pending'
			});

			return {
				form,
				success: true,
				message: 'Channel submitted successfully! It will be reviewed by an admin.'
			};
		} catch (error) {
			console.error('Error creating channel:', error);
			return fail(500, {
				form,
				error: 'Failed to submit channel. Please try again.'
			});
		}
	}
};
;null as any as Actions;
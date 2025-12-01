// src/routes/channel/new/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pendingCreations, sources } from '$lib/server/schema';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

// Define the schema
const channelSchema = v.object({
	channelName: v.pipe(v.string(), v.minLength(1, 'Channel name is required'), v.trim()),
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required'),
		v.trim(),
		v.regex(/^@?[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	),
	bias: v.pipe(v.string(), v.minLength(1, 'Region is required')),
	invite: v.optional(v.pipe(v.string(), v.trim()), ''),
	avatar: v.optional(v.pipe(v.string(), v.url('Invalid URL format'), v.trim()), '')
});

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(valibot(channelSchema));

	return {
		form,
		isAdmin: locals.user.isAdmin
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await superValidate(request, valibot(channelSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { channelName, username, bias, invite, avatar } = form.data;

		// Clean username (remove @ if present)
		const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

		// Process invite link if provided
		let inviteHash: string | null = null;
		if (invite) {
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

		try {
			// If admin, create channel directly
			if (locals.user.isAdmin) {
				await db.insert(sources).values({
					channel_name: channelName,
					username: cleanUsername,
					bias,
					invite: inviteHash,
					avatar: avatar || null
				});

				return {
					form,
					success: true,
					message: 'Channel created successfully!'
				};
			}

			// Non-admin: Insert pending creation for review
			await db.insert(pendingCreations).values({
				userId: locals.user.id,
				channelName,
				username: cleanUsername,
				bias,
				invite: inviteHash,
				avatar: avatar || null,
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

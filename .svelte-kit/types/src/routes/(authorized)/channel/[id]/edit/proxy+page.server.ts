// @ts-nocheck
// src/routes/channel/[id]/edit/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { sources, pendingEdits, bloats } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { channelSchema } from './schema';

export const load = async ({ params, locals }: Parameters<PageServerLoad>[0]) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const channelId = parseInt(params.id);
	if (isNaN(channelId)) {
		redirect(302, '/');
	}

	// Get the channel
	const channel = await db.query.sources.findFirst({
		where: eq(sources.channel_id, channelId)
	});

	if (!channel) {
		redirect(302, '/');
	}

	// Get existing bloats
	const existingBloats = await db.query.bloats.findMany({
		where: eq(bloats.channel_id, channelId)
	});

	const bloatPatterns = existingBloats.map((b) => b.pattern);

	// Check for pending edits by this user
	const pendingEdit = await db.query.pendingEdits.findFirst({
		where: and(
			eq(pendingEdits.channelId, channelId),
			eq(pendingEdits.userId, locals.user.id),
			eq(pendingEdits.status, 'pending')
		)
	});

	// Parse pending bloats if they exist
	let pendingBloats: string[] = [];
	if (pendingEdit?.bloats) {
		try {
			pendingBloats = JSON.parse(pendingEdit.bloats);
		} catch (e) {
			console.error('Failed to parse pending bloats:', e);
		}
	}

	// Use pending edit data if available, otherwise use channel data
	const formData = pendingEdit
		? {
				channel_name: pendingEdit.channelName || channel.channel_name,
				username: pendingEdit.username || channel.username,
				bias: pendingEdit.bias || channel.bias,
				invite: pendingEdit.invite || channel.invite || '',
				avatar: pendingEdit.avatar || channel.avatar || '',
				bloats: pendingBloats
			}
		: {
				channel_name: channel.channel_name,
				username: channel.username,
				bias: channel.bias,
				invite: channel.invite || '',
				avatar: channel.avatar || '',
				bloats: bloatPatterns
			};

	const form = await superValidate(formData, valibot(channelSchema));

	return {
		form,
		channel,
		pendingEdit,
		isAdmin: locals.user.isAdmin,
		existingBloats: bloatPatterns
	};
};

export const actions = {
	default: async ({ request, params, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const channelId = parseInt(params.id);
		const form = await superValidate(request, valibot(channelSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			if (locals.user.isAdmin) {
				// Admin: Apply changes directly
				await db
					.update(sources)
					.set({
						channel_name: form.data.channel_name,
						username: form.data.username,
						bias: form.data.bias,
						invite: form.data.invite || null,
						avatar: form.data.avatar || null
					})
					.where(eq(sources.channel_id, channelId));

				// Update bloats - delete all existing and insert new ones
				await db.delete(bloats).where(eq(bloats.channel_id, channelId));

				if (form.data.bloats && form.data.bloats.length > 0) {
					await db.insert(bloats).values(
						form.data.bloats.map((pattern) => ({
							channel_id: channelId,
							pattern
						}))
					);
				}
			} else {
				// Non-admin: Create or update pending edit
				const existingPending = await db.query.pendingEdits.findFirst({
					where: and(
						eq(pendingEdits.channelId, channelId),
						eq(pendingEdits.userId, locals.user.id),
						eq(pendingEdits.status, 'pending')
					)
				});

				const bloatsJson = JSON.stringify(form.data.bloats || []);

				if (existingPending) {
					// Update existing pending edit
					await db
						.update(pendingEdits)
						.set({
							channelName: form.data.channel_name,
							username: form.data.username,
							bias: form.data.bias,
							invite: form.data.invite || null,
							avatar: form.data.avatar || null,
							bloats: bloatsJson,
							createdAt: new Date()
						})
						.where(eq(pendingEdits.id, existingPending.id));
				} else {
					// Create new pending edit
					await db.insert(pendingEdits).values({
						channelId,
						userId: locals.user.id,
						channelName: form.data.channel_name,
						username: form.data.username,
						bias: form.data.bias,
						invite: form.data.invite || null,
						avatar: form.data.avatar || null,
						bloats: bloatsJson,
						status: 'pending'
					});
				}
			}

			redirect(302, `/channel/${channelId}`);
		} catch (error) {
			console.error('Error saving channel:', error);
			return fail(500, { form, message: 'Failed to save changes' });
		}
	}
};
;null as any as Actions;
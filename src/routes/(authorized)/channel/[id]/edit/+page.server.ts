// src/routes/channel/[id]/edit/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { db, appDb } from '$lib/server/db';
import { sources, bloats, destinations, accounts } from '$lib/server/schema';
import { pendingEdits, files, channelAvatars } from '$lib/server/app-schema';
import { eq, and } from 'drizzle-orm';
import { channelSchema } from './schema';
import { uploadImageWithPreset, setChannelAvatar } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ params, locals }) => {
	const channelId = parseInt(params.id);
	if (isNaN(channelId)) {
		throw error(404, 'Channel not found');
	}

	// Get the channel
	const channel = await db.query.sources.findFirst({
		where: eq(sources.channelId, channelId)
	});

	if (!channel) {
		throw error(404, 'Channel not found');
	}

	// Get existing bloats
	const existingBloats = await db.query.bloats.findMany({
		where: eq(bloats.channelId, channelId)
	});

	const bloatPatterns = existingBloats.map((b) => b.pattern);

	// Current avatar is tracked in mix-sv's own database, not on `sources` itself
	const [currentAvatar] = await appDb
		.select()
		.from(channelAvatars)
		.where(eq(channelAvatars.channelId, channelId))
		.limit(1);
	const currentAvatarFileId = currentAvatar?.fileId ?? '';

	// Check for pending edits by this user
	const pendingEdit = await appDb.query.pendingEdits.findFirst({
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
				channelName: pendingEdit.channelName || channel.channelName,
				username: pendingEdit.username || channel.username,
				bias: pendingEdit.bias || channel.bias,
				invite: pendingEdit.invite || channel.invite || '',
				avatar: pendingEdit.avatar || currentAvatarFileId,
				bloats: pendingBloats
			}
		: {
				channelName: channel.channelName,
				username: channel.username,
				bias: channel.bias,
				invite: channel.invite || '',
				avatar: currentAvatarFileId,
				bloats: bloatPatterns,
				displayName: channel.displayName || '',
				description: channel.description || '',
				rating: channel.rating?.toString() || '',
				destination: channel.destination?.toString() || '',
				isActive: channel.isActive ?? false,
				isSpread: channel.isSpread ?? true
			};

	const form = await superValidate(formData, valibot(channelSchema));

	// Admin-only reference data. Account attachment is display-only here: only ptb-nn
	// may add/remove a source's Telegram account, since that's what actually joins/leaves
	// the channel. mix-sv just shows which account is currently attached.
	const isAdmin = locals.user.isAdmin;
	const destinationOptions = isAdmin ? await db.select().from(destinations) : [];
	const currentAccount = channel.apiId
		? (await db.select().from(accounts).where(eq(accounts.accountId, channel.apiId)).limit(1))[0]
		: null;

	return {
		form,
		channel,
		pendingEdit,
		isAdmin,
		existingBloats: bloatPatterns,
		destinationOptions,
		currentAccount
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const channelId = parseInt(params.id);
		const formData = await request.formData();
		const form = await superValidate(formData, valibot(channelSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Handle avatar upload if file is provided
			let avatarFileId = form.data.avatar || null;
			const avatarFile = formData.get('avatarFile') as File | null;

			if (avatarFile && avatarFile.size > 0) {
				try {
					// Upload with logo preset (96x96px as defined in IMAGE_SIZES)
					const uploadResult = await uploadImageWithPreset(avatarFile, 'logo');

					if (!uploadResult.success) {
						return fail(500, {
							form,
							message: `Failed to upload avatar: ${uploadResult.error}`
						});
					}

					// Save file metadata to database
					const [fileRecord] = await appDb
						.insert(files)
						.values({
							id: crypto.randomUUID(),
							key: uploadResult.key,
							fileName: avatarFile.name,
							contentType: avatarFile.type,
							sizeBytes: avatarFile.size,
							uploadedBy: locals.user.id
						})
						.returning();

					avatarFileId = fileRecord.id;
				} catch (error) {
					console.error('Avatar upload failed:', error);
					return fail(500, {
						form,
						message: 'Failed to upload avatar. Please try again.'
					});
				}
			}

			// Clean username (remove @ if present)
			const cleanUsername = form.data.username?.trim().replace(/^@/, '') || null;

			if (locals.user.isAdmin) {
				// Admin: Apply changes directly, including the extended/admin-only fields
				// Note: apiId (the account attached to this source) is intentionally not
				// writable here - only ptb-nn may attach/detach an account, since that's
				// what actually joins/leaves the channel with that account's Telegram session.
				const rating = form.data.rating ? parseInt(form.data.rating, 10) : null;
				const destination = form.data.destination ? parseInt(form.data.destination, 10) : null;

				await db
					.update(sources)
					.set({
						channelName: form.data.channelName,
						username: cleanUsername,
						bias: form.data.bias,
						invite: form.data.invite || null,
						displayName: form.data.displayName || null,
						description: form.data.description || null,
						rating: Number.isNaN(rating!) ? null : rating,
						destination: Number.isNaN(destination!) ? null : destination,
						isActive: form.data.isActive,
						isSpread: form.data.isSpread
					})
					.where(eq(sources.channelId, channelId));

				// Avatar is tracked in mix-sv's own database, not on `sources` itself
				await setChannelAvatar(channelId, avatarFileId);

				// Update bloats - delete all existing and insert new ones
				await db.delete(bloats).where(eq(bloats.channelId, channelId));

				if (form.data.bloats && form.data.bloats.length > 0) {
					await db.insert(bloats).values(
						form.data.bloats.map((pattern) => ({
							channelId: channelId,
							pattern
						}))
					);
				}
			} else {
				// Non-admin: Create or update pending edit
				const existingPending = await appDb.query.pendingEdits.findFirst({
					where: and(
						eq(pendingEdits.channelId, channelId),
						eq(pendingEdits.userId, locals.user.id),
						eq(pendingEdits.status, 'pending')
					)
				});

				const bloatsJson = JSON.stringify(form.data.bloats || []);

				if (existingPending) {
					// Update existing pending edit
					await appDb
						.update(pendingEdits)
						.set({
							channelName: form.data.channelName,
							username: cleanUsername,
							bias: form.data.bias,
							invite: form.data.invite || null,
							avatar: avatarFileId,
							bloats: bloatsJson,
							createdAt: new Date()
						})
						.where(eq(pendingEdits.id, existingPending.id));
				} else {
					// Create new pending edit
					await appDb.insert(pendingEdits).values({
						channelId,
						userId: locals.user.id,
						channelName: form.data.channelName,
						username: cleanUsername,
						bias: form.data.bias,
						invite: form.data.invite || null,
						avatar: avatarFileId,
						bloats: bloatsJson,
						status: 'pending'
					});
				}
			}

			throw redirect(302, `/channel/${channelId}`);
		} catch (error) {
			console.error('Error saving channel:', error);
			return fail(500, { form, message: 'Failed to save changes' });
		}
	}
};

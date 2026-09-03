// src/routes/(authorized)/pending/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db, appDb } from '$lib/server/db';
import { sources, bloats } from '$lib/server/schema';
import { pendingEdits, pendingCreations, users, files } from '$lib/server/app-schema';
import { eq, and, inArray } from 'drizzle-orm';
import {
	deleteFileFromStorage,
	getAvatarUrlsByFileIds,
	getAvatarUrlsByChannelIds,
	setChannelAvatar
} from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const isAdmin = locals.user.isAdmin;

	// Fetch pending edits with user + edit-avatar info (all in the app database)
	const editStatusFilter = isAdmin
		? eq(pendingEdits.status, 'pending')
		: and(eq(pendingEdits.userId, locals.user.id), eq(pendingEdits.status, 'pending'));

	const edits = await appDb
		.select({
			edit: pendingEdits,
			user: users,
			editAvatarFile: files
		})
		.from(pendingEdits)
		.innerJoin(users, eq(pendingEdits.userId, users.id))
		.leftJoin(files, eq(pendingEdits.avatar, files.id))
		.where(editStatusFilter)
		.orderBy(pendingEdits.createdAt);

	// pendingEdits.channelId refers to schema.ts' sources in the ptb_nn database -
	// a different physical server, so it can't be a SQL join. Fetch the matching
	// sources separately and merge in application code.
	const editChannelIds = [...new Set(edits.map((e) => e.edit.channelId).filter((id) => id !== null))];
	const editSources =
		editChannelIds.length > 0
			? await db.select().from(sources).where(inArray(sources.channelId, editChannelIds))
			: [];
	const sourceByChannelId = new Map(editSources.map((s) => [s.channelId, s]));

	const creationStatusFilter = isAdmin
		? eq(pendingCreations.status, 'pending')
		: and(eq(pendingCreations.userId, locals.user.id), eq(pendingCreations.status, 'pending'));

	const creations = await appDb
		.select({
			creation: pendingCreations,
			user: users,
			avatarFile: files
		})
		.from(pendingCreations)
		.innerJoin(users, eq(pendingCreations.userId, users.id))
		.leftJoin(files, eq(pendingCreations.avatar, files.id))
		.where(creationStatusFilter)
		.orderBy(pendingCreations.createdAt);

	// Batch-resolve every avatar: edit's own upload + each creation's upload (both
	// plain file ids), and each source's current avatar (via channelAvatars).
	const avatarUrls = await getAvatarUrlsByFileIds([
		...edits.map((e) => e.editAvatarFile?.id),
		...creations.map((c) => c.avatarFile?.id)
	]);
	const sourceAvatarUrls = await getAvatarUrlsByChannelIds(editSources.map((s) => s.channelId));

	const editsWithAvatars = edits.map((item) => {
		const source = item.edit.channelId ? sourceByChannelId.get(item.edit.channelId) : undefined;
		return {
			...item,
			source,
			sourceAvatarUrl: source ? (sourceAvatarUrls.get(source.channelId) ?? null) : null,
			editAvatarUrl: item.editAvatarFile ? (avatarUrls.get(item.editAvatarFile.id) ?? null) : null
		};
	});

	const creationsWithAvatars = creations.map((item) => ({
		...item,
		avatarUrl: item.avatarFile ? (avatarUrls.get(item.avatarFile.id) ?? null) : null
	}));

	return {
		pendingEdits: editsWithAvatars,
		pendingCreations: creationsWithAvatars,
		isAdmin
	};
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		const [edit] = await appDb.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);

		if (!edit || edit.channelId === null) {
			return { success: false, error: 'Edit not found' };
		}

		const [source] = await db.select().from(sources).where(eq(sources.channelId, edit.channelId)).limit(1);

		if (!source) {
			return { success: false, error: 'Channel not found' };
		}

		try {
			// Prepare the update object with only non-null fields
			const updateData: any = {};
			if (edit.channelName !== null) updateData.channelName = edit.channelName;
			if (edit.username !== null) updateData.username = edit.username;
			if (edit.bias !== null) updateData.bias = edit.bias;
			if (edit.invite !== null) updateData.invite = edit.invite;

			// Apply the edit to the source
			if (Object.keys(updateData).length > 0) {
				await db.update(sources).set(updateData).where(eq(sources.channelId, edit.channelId));
			}

			// Avatar is tracked in mix-sv's own database, not on `sources` itself
			if (edit.avatar !== null) {
				await setChannelAvatar(edit.channelId, edit.avatar);
			}

			// Handle bloats if present
			if (edit.bloats) {
				try {
					const bloatPatterns: string[] = JSON.parse(edit.bloats);

					// Delete existing bloats for this channel
					await db.delete(bloats).where(eq(bloats.channelId, edit.channelId));

					// Insert new bloats if any
					if (bloatPatterns.length > 0) {
						await db.insert(bloats).values(
							bloatPatterns.map((pattern) => ({
								channelId: edit.channelId!,
								pattern
							}))
						);
					}
				} catch (parseError) {
					console.error('Error parsing bloats:', parseError);
				}
			}

			// Mark as approved
			await appDb
				.update(pendingEdits)
				.set({
					status: 'approved',
					reviewedAt: new Date(),
					reviewedBy: locals.user.id
				})
				.where(eq(pendingEdits.id, editId));

			return { success: true };
		} catch (error) {
			console.error('Error approving edit:', error);
			return { success: false, error: 'Failed to approve edit' };
		}
	},

	reject: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		// Get the edit to check for avatar file
		const [edit] = await appDb
			.select()
			.from(pendingEdits)
			.where(eq(pendingEdits.id, editId))
			.limit(1);

		if (edit?.avatar) {
			// Delete the avatar file since the edit is being rejected
			await deleteFileFromStorage(edit.avatar);
		}

		await appDb
			.update(pendingEdits)
			.set({
				status: 'rejected',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	remove: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		const [edit] = await appDb
			.select()
			.from(pendingEdits)
			.where(eq(pendingEdits.id, editId))
			.limit(1);

		if (!edit) {
			return { success: false, error: 'Edit not found' };
		}

		if (edit.userId !== locals.user.id) {
			return { success: false, error: 'You can only remove your own pending edits' };
		}

		// Delete avatar file if present
		if (edit.avatar) {
			await deleteFileFromStorage(edit.avatar);
		}

		// Delete the pending edit
		await appDb.delete(pendingEdits).where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	approveCreation: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		const [creation] = await appDb
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (!creation) {
			return { success: false, error: 'Creation not found' };
		}

		try {
			// Create the new source
			await db.insert(sources).values({
				channelId: creation.channelId!,
				channelName: creation.channelName,
				username: creation.username,
				bias: creation.bias,
				invite: creation.invite
			});

			// Avatar is tracked in mix-sv's own database, not on `sources` itself
			if (creation.avatar) {
				await setChannelAvatar(creation.channelId!, creation.avatar);
			}

			// Handle bloats if present
			if (creation.bloats) {
				try {
					const bloatPatterns: string[] = JSON.parse(creation.bloats);

					if (bloatPatterns.length > 0) {
						await db.insert(bloats).values(
							bloatPatterns.map((pattern) => ({
								channelId: creation.channelId!,
								pattern
							}))
						);
					}
				} catch (parseError) {
					console.error('Error parsing bloats:', parseError);
				}
			}

			// Mark as approved
			await appDb
				.update(pendingCreations)
				.set({
					status: 'approved',
					reviewedAt: new Date(),
					reviewedBy: locals.user.id
				})
				.where(eq(pendingCreations.id, creationId));

			return { success: true };
		} catch (error) {
			console.error('Error approving creation:', error);
			return {
				success: false,
				error: 'Failed to approve creation. The channel ID may already exist.'
			};
		}
	},

	rejectCreation: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		// Get the creation to check for avatar file
		const [creation] = await appDb
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (creation?.avatar) {
			// Delete the avatar file since the creation is being rejected
			await deleteFileFromStorage(creation.avatar);
		}

		await appDb
			.update(pendingCreations)
			.set({
				status: 'rejected',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingCreations.id, creationId));

		return { success: true };
	},

	removeCreation: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		const [creation] = await appDb
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (!creation) {
			return { success: false, error: 'Creation not found' };
		}

		if (creation.userId !== locals.user.id) {
			return { success: false, error: 'You can only remove your own pending creations' };
		}

		// Delete avatar file if present
		if (creation.avatar) {
			await deleteFileFromStorage(creation.avatar);
		}

		// Delete the pending creation
		await appDb.delete(pendingCreations).where(eq(pendingCreations.id, creationId));

		return { success: true };
	}
};

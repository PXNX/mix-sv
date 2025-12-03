// @ts-nocheck
// src/routes/(authorized)/pending/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { pendingEdits, pendingCreations, sources, users, bloats, files } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFileFromStorage, getSignedDownloadUrl } from '$lib/server/backblaze';

export const load = async ({ locals, url }: Parameters<PageServerLoad>[0]) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const isAdmin = locals.user.isAdmin;

	// Fetch pending edits with file information
	const edits = isAdmin
		? await db
				.select({
					edit: pendingEdits,
					source: sources,
					user: users,
					editAvatarFile: files,
					sourceAvatarFile: files
				})
				.from(pendingEdits)
				.innerJoin(sources, eq(pendingEdits.channelId, sources.channelId))
				.innerJoin(users, eq(pendingEdits.userId, users.id))
				.leftJoin(files, eq(pendingEdits.avatar, files.id))
				.where(eq(pendingEdits.status, 'pending'))
				.orderBy(pendingEdits.createdAt)
		: await db
				.select({
					edit: pendingEdits,
					source: sources,
					user: users,
					editAvatarFile: files,
					sourceAvatarFile: files
				})
				.from(pendingEdits)
				.innerJoin(sources, eq(pendingEdits.channelId, sources.channelId))
				.innerJoin(users, eq(pendingEdits.userId, users.id))
				.leftJoin(files, eq(pendingEdits.avatar, files.id))
				.where(and(eq(pendingEdits.userId, locals.user.id), eq(pendingEdits.status, 'pending')))
				.orderBy(pendingEdits.createdAt);

	// Fetch pending creations with file information
	const creations = isAdmin
		? await db
				.select({
					creation: pendingCreations,
					user: users,
					avatarFile: files
				})
				.from(pendingCreations)
				.innerJoin(users, eq(pendingCreations.userId, users.id))
				.leftJoin(files, eq(pendingCreations.avatar, files.id))
				.where(eq(pendingCreations.status, 'pending'))
				.orderBy(pendingCreations.createdAt)
		: await db
				.select({
					creation: pendingCreations,
					user: users,
					avatarFile: files
				})
				.from(pendingCreations)
				.innerJoin(users, eq(pendingCreations.userId, users.id))
				.leftJoin(files, eq(pendingCreations.avatar, files.id))
				.where(
					and(eq(pendingCreations.userId, locals.user.id), eq(pendingCreations.status, 'pending'))
				)
				.orderBy(pendingCreations.createdAt);

	// Generate signed URLs for edit avatars
	const editsWithAvatars = await Promise.all(
		edits.map(async (item) => {
			// Get avatar URL for the source's current avatar
			const sourceAvatarUrl = item.source.avatar
				? await db
						.select()
						.from(files)
						.where(eq(files.id, item.source.avatar))
						.limit(1)
						.then(async ([file]) => (file ? await getSignedDownloadUrl(file.key) : null))
				: null;

			return {
				...item,
				sourceAvatarUrl,
				editAvatarUrl: item.editAvatarFile
					? await getSignedDownloadUrl(item.editAvatarFile.key)
					: null
			};
		})
	);

	// Generate signed URLs for creation avatars
	const creationsWithAvatars = await Promise.all(
		creations.map(async (item) => ({
			...item,
			avatarUrl: item.avatarFile ? await getSignedDownloadUrl(item.avatarFile.key) : null
		}))
	);

	return {
		pendingEdits: editsWithAvatars,
		pendingCreations: creationsWithAvatars,
		isAdmin
	};
};

export const actions = {
	approve: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		const [editData] = await db
			.select({
				edit: pendingEdits,
				source: sources
			})
			.from(pendingEdits)
			.innerJoin(sources, eq(pendingEdits.channelId, sources.channelId))
			.where(eq(pendingEdits.id, editId))
			.limit(1);

		if (!editData) {
			return { success: false, error: 'Edit not found' };
		}

		const { edit, source } = editData;

		try {
			// Track old avatar for deletion
			const oldAvatarId = source.avatar;

			// Prepare the update object with only non-null fields
			const updateData: any = {};
			if (edit.channelName !== null) updateData.channelName = edit.channelName;
			if (edit.username !== null) updateData.username = edit.username;
			if (edit.bias !== null) updateData.bias = edit.bias;
			if (edit.invite !== null) updateData.invite = edit.invite;
			if (edit.avatar !== null) updateData.avatar = edit.avatar;

			// Apply the edit to the source
			await db.update(sources).set(updateData).where(eq(sources.channelId, edit.channelId!));

			// Delete old avatar file if it was replaced
			if (oldAvatarId && edit.avatar !== null && edit.avatar !== oldAvatarId) {
				await deleteFileFromStorage(oldAvatarId);
			}

			// Handle bloats if present
			if (edit.bloats) {
				try {
					const bloatPatterns: string[] = JSON.parse(edit.bloats);

					// Delete existing bloats for this channel
					await db.delete(bloats).where(eq(bloats.channelId, edit.channelId!));

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
			await db
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

	reject: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		// Get the edit to check for avatar file
		const [edit] = await db.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);

		if (edit?.avatar) {
			// Delete the avatar file since the edit is being rejected
			await deleteFileFromStorage(edit.avatar);
		}

		await db
			.update(pendingEdits)
			.set({
				status: 'rejected',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	remove: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		const [edit] = await db.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);

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
		await db.delete(pendingEdits).where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	approveCreation: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		const [creation] = await db
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
				invite: creation.invite,
				avatar: creation.avatar
			});

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
			await db
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

	rejectCreation: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		// Get the creation to check for avatar file
		const [creation] = await db
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (creation?.avatar) {
			// Delete the avatar file since the creation is being rejected
			await deleteFileFromStorage(creation.avatar);
		}

		await db
			.update(pendingCreations)
			.set({
				status: 'rejected',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingCreations.id, creationId));

		return { success: true };
	},

	removeCreation: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		const [creation] = await db
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
		await db.delete(pendingCreations).where(eq(pendingCreations.id, creationId));

		return { success: true };
	}
};
;null as any as Actions;
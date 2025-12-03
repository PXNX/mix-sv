// src/routes/(authorized)/pending/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { pendingEdits, pendingCreations, sources, users, bloats } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const isAdmin = locals.user.isAdmin;

	// Fetch pending edits
	const edits = isAdmin
		? await db
				.select({
					edit: pendingEdits,
					source: sources,
					user: users
				})
				.from(pendingEdits)
				.innerJoin(sources, eq(pendingEdits.channelId, sources.channelId))
				.innerJoin(users, eq(pendingEdits.userId, users.id))
				.where(eq(pendingEdits.status, 'pending'))
				.orderBy(pendingEdits.createdAt)
		: await db
				.select({
					edit: pendingEdits,
					source: sources,
					user: users
				})
				.from(pendingEdits)
				.innerJoin(sources, eq(pendingEdits.channelId, sources.channelId))
				.innerJoin(users, eq(pendingEdits.userId, users.id))
				.where(and(eq(pendingEdits.userId, locals.user.id), eq(pendingEdits.status, 'pending')))
				.orderBy(pendingEdits.createdAt);

	// Fetch pending creations
	const creations = isAdmin
		? await db
				.select({
					creation: pendingCreations,
					user: users
				})
				.from(pendingCreations)
				.innerJoin(users, eq(pendingCreations.userId, users.id))
				.where(eq(pendingCreations.status, 'pending'))
				.orderBy(pendingCreations.createdAt)
		: await db
				.select({
					creation: pendingCreations,
					user: users
				})
				.from(pendingCreations)
				.innerJoin(users, eq(pendingCreations.userId, users.id))
				.where(
					and(eq(pendingCreations.userId, locals.user.id), eq(pendingCreations.status, 'pending'))
				)
				.orderBy(pendingCreations.createdAt);

	return {
		pendingEdits: edits,
		pendingCreations: creations,
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

		const edit = await db.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);
		if (!edit[0]) {
			return { success: false, error: 'Edit not found' };
		}

		try {
			// Prepare the update object with only non-null fields
			const updateData: any = {};
			if (edit[0].channelName !== null) updateData.channel_name = edit[0].channelName;
			if (edit[0].username !== null) updateData.username = edit[0].username;
			if (edit[0].bias !== null) updateData.bias = edit[0].bias;
			if (edit[0].invite !== null) updateData.invite = edit[0].invite;
			if (edit[0].avatar !== null) updateData.avatar = edit[0].avatar;

			// Apply the edit to the source
			await db.update(sources).set(updateData).where(eq(sources.channelId, edit[0].channelId!));

			// Handle bloats if present
			if (edit[0].bloats) {
				try {
					const bloatPatterns: string[] = JSON.parse(edit[0].bloats);

					// Delete existing bloats for this channel
					await db.delete(bloats).where(eq(bloats.channelId, edit[0].channelId!));

					// Insert new bloats if any
					if (bloatPatterns.length > 0) {
						await db.insert(bloats).values(
							bloatPatterns.map((pattern) => ({
								channelId: edit[0].channelId!,
								pattern
							}))
						);
					}
				} catch (parseError) {
					console.error('Error parsing bloats:', parseError);
					// Continue even if bloats fail
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

	reject: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

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

	remove: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		// Verify the edit belongs to the user
		const edit = await db.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);
		if (!edit[0]) {
			return { success: false, error: 'Edit not found' };
		}

		if (edit[0].userId !== locals.user.id) {
			return { success: false, error: 'You can only remove your own pending edits' };
		}

		// Delete the pending edit
		await db.delete(pendingEdits).where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	approveCreation: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		const creation = await db
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (!creation[0]) {
			return { success: false, error: 'Creation not found' };
		}

		try {
			// Create the new source
			await db.insert(sources).values({
				channelId: creation[0].channelId!,
				channelName: creation[0].channelName,
				username: creation[0].username,
				bias: creation[0].bias,
				invite: creation[0].invite,
				avatar: creation[0].avatar
			});

			// Handle bloats if present
			if (creation[0].bloats) {
				try {
					const bloatPatterns: string[] = JSON.parse(creation[0].bloats);

					// Insert bloats if any
					if (bloatPatterns.length > 0) {
						await db.insert(bloats).values(
							bloatPatterns.map((pattern) => ({
								channelId: creation[0].channelId!,
								pattern
							}))
						);
					}
				} catch (parseError) {
					console.error('Error parsing bloats:', parseError);
					// Continue even if bloats fail
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

	rejectCreation: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

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

	removeCreation: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const formData = await request.formData();
		const creationId = parseInt(formData.get('creationId')?.toString() || '');

		// Verify the creation belongs to the user
		const creation = await db
			.select()
			.from(pendingCreations)
			.where(eq(pendingCreations.id, creationId))
			.limit(1);

		if (!creation[0]) {
			return { success: false, error: 'Creation not found' };
		}

		if (creation[0].userId !== locals.user.id) {
			return { success: false, error: 'You can only remove your own pending creations' };
		}

		// Delete the pending creation
		await db.delete(pendingCreations).where(eq(pendingCreations.id, creationId));

		return { success: true };
	}
};

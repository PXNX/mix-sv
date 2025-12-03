// @ts-nocheck
// src/routes/submissions/+page.server.ts
import { fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pendingCreations, pendingEdits, files } from '$lib/server/schema';
import { deleteFileFromStorage, getSignedDownloadUrl } from '$lib/server/backblaze';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	// Fetch user's pending creations with avatar files
	const userCreations = await db
		.select({
			creation: pendingCreations,
			avatarFile: files
		})
		.from(pendingCreations)
		.leftJoin(files, eq(pendingCreations.avatar, files.id))
		.where(eq(pendingCreations.userId, locals.user.id))
		.orderBy(pendingCreations.createdAt);

	// Fetch user's pending edits with avatar files
	const userEdits = await db
		.select({
			edit: pendingEdits,
			avatarFile: files
		})
		.from(pendingEdits)
		.leftJoin(files, eq(pendingEdits.avatar, files.id))
		.where(eq(pendingEdits.userId, locals.user.id))
		.orderBy(pendingEdits.createdAt);

	// Generate signed URLs for avatar files
	const creationsWithAvatars = await Promise.all(
		userCreations.map(async (item) => ({
			...item.creation,
			avatarUrl: item.avatarFile ? await getSignedDownloadUrl(item.avatarFile.key) : null
		}))
	);

	const editsWithAvatars = await Promise.all(
		userEdits.map(async (item) => ({
			...item.edit,
			avatarUrl: item.avatarFile ? await getSignedDownloadUrl(item.avatarFile.key) : null
		}))
	);

	return {
		user: locals.user,
		pendingCreations: creationsWithAvatars,
		pendingEdits: editsWithAvatars
	};
};

export const actions = {
	deleteCreation: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return fail(401, {
				error: 'You must be logged in to delete submissions'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, {
				error: 'Submission ID is required'
			});
		}

		const submissionId = parseInt(id.toString(), 10);
		if (isNaN(submissionId)) {
			return fail(400, {
				error: 'Invalid submission ID'
			});
		}

		try {
			// Verify the submission belongs to the user and is pending
			const [submission] = await db
				.select()
				.from(pendingCreations)
				.where(
					and(eq(pendingCreations.id, submissionId), eq(pendingCreations.userId, locals.user.id))
				)
				.limit(1);

			if (!submission) {
				return fail(404, {
					error: 'Submission not found or you do not have permission to delete it'
				});
			}

			if (submission.status !== 'pending') {
				return fail(400, {
					error: 'Only pending submissions can be deleted'
				});
			}

			// Delete avatar file if present
			if (submission.avatar) {
				await deleteFileFromStorage(submission.avatar);
			}

			// Delete the submission
			await db.delete(pendingCreations).where(eq(pendingCreations.id, submissionId));

			return {
				success: true,
				message: 'Submission deleted successfully'
			};
		} catch (error) {
			console.error('Error deleting creation:', error);
			return fail(500, {
				error: 'Failed to delete submission. Please try again.'
			});
		}
	},

	deleteEdit: async ({ request, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return fail(401, {
				error: 'You must be logged in to delete submissions'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, {
				error: 'Edit ID is required'
			});
		}

		const editId = parseInt(id.toString(), 10);
		if (isNaN(editId)) {
			return fail(400, {
				error: 'Invalid edit ID'
			});
		}

		try {
			// Verify the edit belongs to the user and is pending
			const [edit] = await db
				.select()
				.from(pendingEdits)
				.where(and(eq(pendingEdits.id, editId), eq(pendingEdits.userId, locals.user.id)))
				.limit(1);

			if (!edit) {
				return fail(404, {
					error: 'Edit not found or you do not have permission to delete it'
				});
			}

			if (edit.status !== 'pending') {
				return fail(400, {
					error: 'Only pending edits can be deleted'
				});
			}

			// Delete avatar file if present
			if (edit.avatar) {
				await deleteFileFromStorage(edit.avatar);
			}

			// Delete the edit
			await db.delete(pendingEdits).where(eq(pendingEdits.id, editId));

			return {
				success: true,
				message: 'Edit deleted successfully'
			};
		} catch (error) {
			console.error('Error deleting edit:', error);
			return fail(500, {
				error: 'Failed to delete edit. Please try again.'
			});
		}
	}
};
;null as any as Actions;
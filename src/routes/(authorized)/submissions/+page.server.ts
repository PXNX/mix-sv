// src/routes/submissions/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pendingCreations, pendingEdits } from '$lib/server/schema';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Fetch user's pending creations
	const userCreations = await db
		.select()
		.from(pendingCreations)
		.where(eq(pendingCreations.userId, locals.user.id))
		.orderBy(pendingCreations.createdAt);

	// Fetch user's pending edits
	const userEdits = await db
		.select()
		.from(pendingEdits)
		.where(eq(pendingEdits.userId, locals.user.id))
		.orderBy(pendingEdits.createdAt);

	return {
		user: locals.user,
		pendingCreations: userCreations,
		pendingEdits: userEdits
	};
};

export const actions: Actions = {
	deleteCreation: async ({ request, locals }) => {
		// Check authentication
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

	deleteEdit: async ({ request, locals }) => {
		// Check authentication
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

// src/routes/api/avatar/[key]/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { files } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl } from '$lib/server/backblaze';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const { key } = params;

	if (!key) {
		throw error(400, 'File key is required');
	}

	try {
		// Find the file record
		const fileRecord = await db.query.files.findFirst({
			where: eq(files.key, key)
		});

		if (!fileRecord) {
			throw error(404, 'File not found');
		}

		// Get signed URL from Backblaze
		const signedUrl = await getSignedDownloadUrl(fileRecord.key);

		// Set caching headers
		setHeaders({
			'Cache-Control': 'public, max-age=604800, immutable', // 7 days
			'Content-Type': fileRecord.contentType
		});

		// Redirect to the signed URL
		return new Response(null, {
			status: 302,
			headers: {
				Location: signedUrl
			}
		});
	} catch (err) {
		console.error('Error serving avatar:', err);
		throw error(500, 'Failed to serve avatar');
	}
};

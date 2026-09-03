// src/lib/server/backblaze.ts
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
	BACKBLAZE_KEY_ID,
	BACKBLAZE_APPLICATION_KEY,
	BACKBLAZE_BUCKET_NAME,
	BACKBLAZE_REGION,
	BACKBLAZE_ENDPOINT
} from '$env/static/private';
import { appDb } from './db';
import { files, channelAvatars } from './app-schema';
import { eq, inArray } from 'drizzle-orm';

const s3Client = new S3Client({
	endpoint: BACKBLAZE_ENDPOINT,
	region: BACKBLAZE_REGION,
	credentials: {
		accessKeyId: BACKBLAZE_KEY_ID,
		secretAccessKey: BACKBLAZE_APPLICATION_KEY
	},
	forcePathStyle: true
});

export interface UploadResult {
	success: boolean;
	key: string;
	error?: string;
}

export interface ImageDimensions {
	width: number;
	height: number;
	// Bun.Image only supports these two (no cover/contain/outside like sharp had).
	// 'inside' fits within the box preserving aspect ratio; the actual square/cover
	// crop is done client-side instead (see ChannelAvatar.svelte's object-cover).
	fit?: 'fill' | 'inside';
	quality?: number; // JPEG quality (1-100)
}

// Predefined image sizes
export const IMAGE_SIZES = {
	logo: { width: 96, height: 96, fit: 'inside' as const, quality: 90 },
	locationImage: { width: 420, height: 256, fit: 'inside' as const, quality: 85 }
} as const;

/**
 * Resize and optimize an image
 * @param buffer - Original image buffer
 * @param dimensions - Target dimensions and options
 * @returns Processed image buffer
 */
async function processImage(
	buffer: Buffer,
	dimensions: ImageDimensions
): Promise<{ buffer: Buffer; contentType: string }> {
	const { width, height, fit = 'inside', quality = 85 } = dimensions;

	// Requires the Bun runtime (see svelte.config.js's adapter runtime option) -
	// this global doesn't exist under Node.js.
	const { format } = await new Bun.Image(buffer).metadata();
	const resized = new Bun.Image(buffer).resize(width, height, { fit });

	// PNGs keep their format (preserves transparency); everything else becomes JPEG.
	const isPng = format === 'png';
	const encoded = isPng ? resized.png({ compressionLevel: 9 }) : resized.jpeg({ quality });

	return {
		buffer: Buffer.from(await encoded.buffer()),
		contentType: isPng ? 'image/png' : 'image/jpeg'
	};
}

/**
 * Upload a file buffer to Backblaze B2
 * @param buffer - File buffer to upload
 * @param fileName - Original filename (for reference)
 * @param contentType - MIME type of the file
 * @param dimensions - Optional image dimensions for resizing
 * @returns Upload result with storage key
 */
export async function uploadFile(
	buffer: Buffer,
	fileName: string,
	contentType: string,
	dimensions?: ImageDimensions
): Promise<UploadResult> {
	try {
		let processedBuffer = buffer;
		let finalContentType = contentType;

		// Process image if dimensions provided and file is an image
		if (dimensions && contentType.startsWith('image/')) {
			try {
				const processed = await processImage(buffer, dimensions);
				processedBuffer = processed.buffer;
				finalContentType = processed.contentType;
			} catch (error) {
				console.error('Image processing failed, using original:', error);
				// Continue with original buffer if processing fails
			}
		}

		// Generate unique key with file extension
		const extension = fileName.split('.').pop() || '';
		const uniqueKey = `${randomUUID()}.${extension}`;

		const command = new PutObjectCommand({
			Bucket: BACKBLAZE_BUCKET_NAME,
			Key: uniqueKey,
			Body: processedBuffer,
			ContentType: finalContentType,
			CacheControl: 'public, max-age=31536000, immutable',
			Metadata: {
				originalName: fileName,
				uploadedAt: new Date().toISOString(),
				...(dimensions && { resized: `${dimensions.width}x${dimensions.height}` })
			}
		});

		await s3Client.send(command);

		return {
			success: true,
			key: uniqueKey
		};
	} catch (error) {
		console.error('Upload failed:', error);
		return {
			success: false,
			key: '',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Upload a file directly from FormData with optional resizing
 * @param file - File from form input
 * @param dimensions - Optional image dimensions for resizing
 * @returns Upload result with storage key
 */
export async function uploadFileFromForm(
	file: File,
	dimensions?: ImageDimensions
): Promise<UploadResult> {
	if (!file || file.size === 0) {
		return {
			success: false,
			key: '',
			error: 'No file provided or file is empty'
		};
	}

	// Validate file size (5MB limit for original)
	const maxSize = 5 * 1024 * 1024;
	if (file.size > maxSize) {
		return {
			success: false,
			key: '',
			error: 'File size exceeds 5MB limit'
		};
	}

	// Validate image type if dimensions provided
	if (dimensions && !file.type.startsWith('image/')) {
		return {
			success: false,
			key: '',
			error: 'File must be an image for resizing'
		};
	}

	// Convert to buffer
	const buffer = Buffer.from(await file.arrayBuffer());

	return uploadFile(buffer, file.name, file.type, dimensions);
}

/**
 * Upload image with predefined size preset
 * @param file - File from form input
 * @param sizePreset - Predefined size from IMAGE_SIZES
 * @returns Upload result with storage key
 */
export async function uploadImageWithPreset(
	file: File,
	sizePreset: keyof typeof IMAGE_SIZES
): Promise<UploadResult> {
	const dimensions = IMAGE_SIZES[sizePreset];
	return uploadFileFromForm(file, dimensions);
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ContentType: contentType,
		CacheControl: 'public, max-age=31536000, immutable'
	});

	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Get signed download URL with extended expiration for caching
 * @param key - File key in B2
 * @param expiresIn - Expiration time in seconds (default: 7 days for better caching)
 * @returns Signed URL
 */
export async function getSignedDownloadUrl(
	key: string,
	expiresIn: number = 604800 // 7 days
): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ResponseCacheControl: 'public, max-age={' + expiresIn + '}, immutable'
	});

	return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get signed download URL with short expiration (for sensitive content)
 * @param key - File key in B2
 * @returns Signed URL with 1 hour expiration
 */
export async function getSignedDownloadUrlShort(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ResponseCacheControl: 'public, max-age=3600'
	});

	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFileFromStorage(fileId: string) {
	try {
		// Get file info
		const [file] = await appDb.select().from(files).where(eq(files.id, fileId)).limit(1);

		if (!file) return;

		// Delete from B2
		const deleteCommand = new DeleteObjectCommand({
			Bucket: BACKBLAZE_BUCKET_NAME,
			Key: file.key
		});
		await s3Client.send(deleteCommand);

		// Delete from database
		await appDb.delete(files).where(eq(files.id, fileId));
	} catch (error) {
		console.error('Error deleting file:', error);
		// Don't throw - we still want the operation to succeed even if file deletion fails
	}
}

/**
 * Resolve file ids (e.g. pending_edits.avatar/pending_creations.avatar) to
 * signed URLs, in one batched query against the app database.
 */
export async function getAvatarUrlsByFileIds(
	fileIds: (string | null | undefined)[]
): Promise<Map<string, string>> {
	const ids = [...new Set(fileIds.filter((id): id is string => !!id))];
	const urls = new Map<string, string>();
	if (ids.length === 0) return urls;

	const records = await appDb.select().from(files).where(inArray(files.id, ids));
	await Promise.all(
		records.map(async (file) => {
			try {
				urls.set(file.id, await getSignedDownloadUrl(file.key));
			} catch (err) {
				console.error(`Failed to generate avatar URL for file ${file.id}:`, err);
			}
		})
	);
	return urls;
}

/**
 * Resolve source channel ids to their current avatar's signed URL, via
 * app-schema.ts' channelAvatars mapping (sources.avatar doesn't exist on the
 * real ptb_nn table, so this is tracked entirely on mix-sv's side).
 */
export async function getAvatarUrlsByChannelIds(
	channelIds: (number | null | undefined)[]
): Promise<Map<number, string>> {
	const ids = [...new Set(channelIds.filter((id): id is number => id != null))];
	const urls = new Map<number, string>();
	if (ids.length === 0) return urls;

	const records = await appDb
		.select({ channelId: channelAvatars.channelId, key: files.key })
		.from(channelAvatars)
		.innerJoin(files, eq(channelAvatars.fileId, files.id))
		.where(inArray(channelAvatars.channelId, ids));

	await Promise.all(
		records.map(async (record) => {
			try {
				urls.set(record.channelId, await getSignedDownloadUrl(record.key));
			} catch (err) {
				console.error(`Failed to generate avatar URL for channel ${record.channelId}:`, err);
			}
		})
	);
	return urls;
}

/** Set (or clear, if fileId is null) the current avatar for a source channel. */
export async function setChannelAvatar(channelId: number, fileId: string | null) {
	const [existing] = await appDb
		.select()
		.from(channelAvatars)
		.where(eq(channelAvatars.channelId, channelId))
		.limit(1);

	if (fileId === null) {
		if (existing) {
			await appDb.delete(channelAvatars).where(eq(channelAvatars.channelId, channelId));
			await deleteFileFromStorage(existing.fileId);
		}
		return;
	}

	if (existing && existing.fileId === fileId) return;

	await appDb
		.insert(channelAvatars)
		.values({ channelId, fileId })
		.onConflictDoUpdate({
			target: channelAvatars.channelId,
			set: { fileId, updatedAt: new Date() }
		});

	if (existing) {
		await deleteFileFromStorage(existing.fileId);
	}
}

// src/routes/channel/new/schema.ts
import * as v from 'valibot';

export const channelSchema = v.object({
	channelId: v.pipe(
		v.string(),
		v.minLength(1, 'Channel ID is required'),
		v.trim(),
		v.regex(/^-?\d+$/, 'Channel ID must be a valid number (e.g., -1001234567890)')
	),
	channelName: v.pipe(v.string(), v.minLength(1, 'Channel name is required'), v.trim()),
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required'),
		v.trim(),
		v.regex(/^@?[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	),
	bias: v.pipe(v.string(), v.minLength(1, 'Region is required')),
	invite: v.optional(v.pipe(v.string(), v.trim()), ''),
	bloats: v.optional(v.array(v.pipe(v.string(), v.trim(), v.minLength(1))), [])
});

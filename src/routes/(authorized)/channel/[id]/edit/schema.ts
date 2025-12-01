import * as v from 'valibot';

export const channelSchema = v.object({
	channel_name: v.pipe(v.string(), v.minLength(1, 'Channel name is required'), v.trim()),
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required'),
		v.trim(),
		v.regex(/^@?[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	),
	bias: v.pipe(v.string(), v.minLength(1, 'Region is required')),
	invite: v.optional(v.pipe(v.string(), v.trim()), ''),
	avatar: v.optional(v.pipe(v.string(), v.url('Invalid URL format'), v.trim()), '')
});

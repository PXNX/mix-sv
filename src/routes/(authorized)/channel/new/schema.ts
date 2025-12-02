// src/routes/channel/new/schema.ts
import * as v from 'valibot';

export const channelSchema = v.pipe(
	v.object({
		channelId: v.pipe(
			v.string(),
			v.minLength(1, 'Channel ID is required'),
			v.trim(),
			v.regex(/^-?\d+$/, 'Channel ID must be a valid number (e.g., -1001234567890)')
		),
		channelName: v.pipe(v.string(), v.minLength(1, 'Channel name is required'), v.trim()),
		username: v.pipe(
			v.optional(v.string(), ''),
			v.trim(),
			v.check((value) => {
				// If empty, it's valid
				if (!value || value === '') return true;
				// If not empty, must match the pattern
				return /^@?[a-zA-Z0-9_]+$/.test(value);
			}, 'Username can only contain letters, numbers, and underscores')
		),
		bias: v.pipe(v.string(), v.minLength(1, 'Region is required')),
		invite: v.optional(v.pipe(v.string(), v.trim()), ''),
		bloats: v.optional(v.array(v.pipe(v.string(), v.trim(), v.minLength(1))), [])
	}),
	v.check((data) => {
		// If no username is provided, invite link is required
		if (!data.username || data.username.trim() === '') {
			return !!data.invite && data.invite.trim() !== '';
		}
		return true;
	}, 'Invite link is required for private channels (channels without a username)')
);

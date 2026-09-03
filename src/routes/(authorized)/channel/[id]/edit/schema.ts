// src/routes/channel/[id]/edit/schema.ts
import * as v from 'valibot';

export const channelSchema = v.pipe(
	v.object({
		channelName: v.pipe(v.string(), v.minLength(1, 'Channel name is required'), v.trim()),
		username: v.pipe(
			v.optional(v.string(), ''),
			v.trim(),
			v.check((value) => {
				if (!value || value === '') return true;
				return /^@?[a-zA-Z0-9_]+$/.test(value);
			}, 'Username can only contain letters, numbers, and underscores')
		),
		bias: v.pipe(v.string(), v.minLength(1, 'Bias is required')),
		invite: v.optional(v.pipe(v.string(), v.trim()), ''),
		avatar: v.optional(v.pipe(v.string(), v.trim()), ''),
		bloats: v.optional(v.array(v.pipe(v.string(), v.trim(), v.minLength(1))), []),
		// Admin-only fields (ignored server-side unless the requester is an admin)
		displayName: v.optional(v.pipe(v.string(), v.trim()), ''),
		description: v.optional(v.pipe(v.string(), v.trim()), ''),
		rating: v.optional(v.pipe(v.string(), v.trim()), ''),
		destination: v.optional(v.pipe(v.string(), v.trim()), ''),
		isActive: v.optional(v.boolean(), false),
		isSpread: v.optional(v.boolean(), true)
	}),
	v.check((data) => {
		if (!data.username || data.username.trim() === '') {
			return !!data.invite && data.invite.trim() !== '';
		}
		return true;
	}, 'Invite link is required for private channels')
);

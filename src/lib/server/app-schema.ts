// src/lib/server/app-schema.ts
// Tables owned by mix-sv itself (auth + moderation queue), living in mix-sv's
// own Neon database - kept separate from ptb_nn (see schema.ts). `channelId`
// on pending_edits/pending_creations refers to schema.ts' `sources.channelId`,
// but since that's a different physical database it can't be a real FK here.
import { pgTable, serial, text, integer, boolean, timestamp, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').unique(), // Made optional for Telegram users
	telegramId: bigint('telegram_id', { mode: 'number' }).unique(),
	username: text('username'),
	picture: text('picture'),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Sessions table
export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Files uploaded to Backblaze
export const files = pgTable('files', {
	id: text('id').primaryKey(),
	key: text('key').notNull().unique(),
	fileName: text('file_name').notNull(),
	contentType: text('content_type').notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	uploadedBy: text('uploaded_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow()
});

// Current avatar per source channel. Lives here (not on schema.ts' `sources`)
// because the real `sources` table (owned by ptb-nn/tg-nn) has no avatar column
// and mix-sv isn't adding one - so the channelId -> avatar file mapping is
// tracked entirely on mix-sv's side instead. channelId refers to schema.ts'
// sources.channelId, but that's a different database, so not a real FK.
export const channelAvatars = pgTable('channel_avatars', {
	channelId: bigint('channel_id', { mode: 'number' }).primaryKey(),
	fileId: text('file_id')
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Pending edits table (references schema.ts' sources.channelId - cross-database, not a real FK)
export const pendingEdits = pgTable('pending_edits', {
	id: serial('id').primaryKey(),
	channelId: bigint('channel_id', { mode: 'number' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// Edit fields
	channelName: text('channel_name'),
	username: text('username'),
	bias: text('bias'),
	invite: text('invite'),
	avatar: text('avatar').references(() => files.id, { onDelete: 'set null' }),
	bloats: text('bloats'), // JSON array of patterns
	status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

// Pending creations table (channelId refers to schema.ts' sources.channelId once approved)
export const pendingCreations = pgTable('pending_creations', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	channelId: bigint('channel_id', { mode: 'number' }),
	channelName: text('channel_name').notNull(),
	username: text('username').notNull(),
	bias: text('bias').notNull(),
	invite: text('invite'),
	avatar: text('avatar').references(() => files.id, { onDelete: 'set null' }),
	bloats: text('bloats'), // JSON array of patterns
	status: text('status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	pendingEdits: many(pendingEdits),
	pendingCreations: many(pendingCreations),
	uploadedFiles: many(files)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const filesRelations = relations(files, ({ one }) => ({
	uploadedBy: one(users, {
		fields: [files.uploadedBy],
		references: [users.id]
	})
}));

export const channelAvatarsRelations = relations(channelAvatars, ({ one }) => ({
	file: one(files, {
		fields: [channelAvatars.fileId],
		references: [files.id]
	})
}));

export const pendingEditsRelations = relations(pendingEdits, ({ one }) => ({
	user: one(users, {
		fields: [pendingEdits.userId],
		references: [users.id]
	}),
	reviewer: one(users, {
		fields: [pendingEdits.reviewedBy],
		references: [users.id]
	}),
	avatarFile: one(files, {
		fields: [pendingEdits.avatar],
		references: [files.id]
	})
}));

export const pendingCreationsRelations = relations(pendingCreations, ({ one }) => ({
	user: one(users, {
		fields: [pendingCreations.userId],
		references: [users.id]
	}),
	reviewer: one(users, {
		fields: [pendingCreations.reviewedBy],
		references: [users.id]
	}),
	avatarFile: one(files, {
		fields: [pendingCreations.avatar],
		references: [files.id]
	})
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type ChannelAvatar = typeof channelAvatars.$inferSelect;
export type NewChannelAvatar = typeof channelAvatars.$inferInsert;
export type PendingEdit = typeof pendingEdits.$inferSelect;
export type NewPendingEdit = typeof pendingEdits.$inferInsert;
export type PendingCreation = typeof pendingCreations.$inferSelect;
export type NewPendingCreation = typeof pendingCreations.$inferInsert;

// src/lib/server/schema.ts
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const sources = pgTable('sources', {
	channel_id: serial('channel_id').primaryKey(),
	channel_name: text('channel_name').notNull(),
	username: text('username').notNull(),
	bias: text('bias').notNull(),
	invite: text('invite'),
	avatar: text('avatar')
});

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	picture: text('picture'),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const pendingEdits = pgTable('pending_edits', {
	id: serial('id').primaryKey(),
	channelId: integer('channel_id').references(() => sources.channel_id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Edit fields
	channelName: text('channel_name'),
	username: text('username'),
	bias: text('bias'),
	invite: text('invite'),
	avatar: text('avatar'),

	status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

export const pendingCreations = pgTable('pending_creations', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	channelName: text('channel_name').notNull(),
	username: text('username').notNull(),
	bias: text('bias').notNull(),
	invite: text('invite'),
	avatar: text('avatar'),

	status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type PendingEdit = typeof pendingEdits.$inferSelect;
export type NewPendingEdit = typeof pendingEdits.$inferInsert;
export type PendingCreation = typeof pendingCreations.$inferSelect;
export type NewPendingCreation = typeof pendingCreations.$inferInsert;

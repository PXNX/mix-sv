// src/lib/server/schema.ts
import {
	pgTable,
	serial,
	text,
	integer,
	boolean,
	timestamp,
	bigint,
	primaryKey,
	index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sources table (channels)
export const sources = pgTable('sources', {
	channel_id: bigint('channel_id', { mode: 'number' }).primaryKey(),
	channel_name: text('channel_name').notNull(),
	bias: text('bias').notNull(),
	username: text('username'),
	invite: text('invite'),
	avatar: text('avatar')
});

// Bloats table (regex patterns for filtering)
export const bloats = pgTable(
	'bloats',
	{
		channel_id: bigint('channel_id', { mode: 'number' })
			.notNull()
			.references(() => sources.channel_id, { onDelete: 'cascade' }),
		pattern: text('pattern').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.channel_id, table.pattern] }),
		channelIdIdx: index('idx_bloats_channel_id').on(table.channel_id)
	})
);

// Users table
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
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

// Pending edits table
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
	bloats: text('bloats'), // JSON array of patterns
	status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

// Pending creations table
export const pendingCreations = pgTable('pending_creations', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	channelId: integer('channel_id'),
	channelName: text('channel_name').notNull(),
	username: text('username').notNull(),
	bias: text('bias').notNull(),
	invite: text('invite'),
	avatar: text('avatar'),
	bloats: text('bloats'), // JSON array of patterns
	status: text('status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});

// Relations
export const sourcesRelations = relations(sources, ({ many }) => ({
	bloats: many(bloats)
}));

export const bloatsRelations = relations(bloats, ({ one }) => ({
	source: one(sources, {
		fields: [bloats.channel_id],
		references: [sources.channel_id]
	})
}));

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	pendingEdits: many(pendingEdits),
	pendingCreations: many(pendingCreations)
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
	channel: one(sources, {
		fields: [pendingEdits.channelId],
		references: [sources.channel_id]
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
	})
}));

// Type exports
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Bloat = typeof bloats.$inferSelect;
export type NewBloat = typeof bloats.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PendingEdit = typeof pendingEdits.$inferSelect;
export type NewPendingEdit = typeof pendingEdits.$inferInsert;
export type PendingCreation = typeof pendingCreations.$inferSelect;
export type NewPendingCreation = typeof pendingCreations.$inferInsert;

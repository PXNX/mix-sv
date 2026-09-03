// src/lib/server/schema.ts
// Tables owned by ptb-nn/tg-nn, living in the ptb_nn database on mn.
// mix-sv reads all of these and may write to `sources` (except `avatar`,
// which is only ever set by mix-sv itself, and `api_id`, which only ptb-nn
// may change since it's the one that actually joins/leaves the channel).
// mix-sv's own tables (users/sessions/files/pending_edits/pending_creations)
// live in a separate Neon database - see app-schema.ts. Because these are two
// physically separate Postgres servers, there is no DB-level foreign key from
// `sources.avatar` to the `files` table anymore; it's just a plain id string.
import { pgTable, text, integer, boolean, bigint, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Destinations table (channels sources get reposted into)
export const destinations = pgTable('destinations', {
	channelId: bigint('channel_id', { mode: 'number' }).primaryKey(),
	name: text('name').notNull(),
	groupId: bigint('group_id', { mode: 'number' }),
	footer: text('footer')
});

// Accounts table (Telegram API accounts used to collect/post)
export const accounts = pgTable('accounts', {
	accountId: bigint('account_id', { mode: 'number' }).primaryKey(),
	apiId: bigint('api_id', { mode: 'number' }).notNull(),
	apiHash: text('api_hash').notNull(),
	userId: bigint('user_id', { mode: 'number' }).notNull(),
	name: text('name').notNull(),
	phoneNumber: text('phone_number').notNull(),
	description: text('description')
});

// Sources table (channels)
export const sources = pgTable('sources', {
	channelId: bigint('channel_id', { mode: 'number' }).primaryKey(),
	channelName: text('channel_name').notNull(),
	bias: text('bias'),
	displayName: text('display_name'),
	username: text('username'),
	invite: text('invite'),
	// Column is named api_id for historical reasons but references accounts.accountId,
	// i.e. it's the account used to collect/post this source, not a Telegram API id.
	// mix-sv only ever reads this - only ptb-nn writes it.
	apiId: bigint('api_id', { mode: 'number' }).references(() => accounts.accountId),
	description: text('description'),
	rating: integer('rating'),
	destination: bigint('destination', { mode: 'number' }).references(() => destinations.channelId),
	detailId: integer('detail_id'),
	isActive: boolean('is_active').default(false),
	isSpread: boolean('is_spread').notNull().default(true)
	// No `avatar` column here - the real table (owned by ptb-nn/tg-nn) doesn't have
	// one, and mix-sv isn't adding one. Avatar-per-channel is tracked entirely in
	// mix-sv's own database instead - see app-schema.ts' `channelAvatars` table.
});

// Bloats table (regex patterns for filtering)
export const bloats = pgTable(
	'bloats',
	{
		channelId: bigint('channel_id', { mode: 'number' })
			.notNull()
			.references(() => sources.channelId, { onDelete: 'cascade' }),
		pattern: text('pattern').notNull()
		// No `created_at` here either, for the same reason - the real table doesn't have it.
	},
	(table) => ({
		pk: primaryKey({ columns: [table.channelId, table.pattern] })
	})
);

// Relations
export const sourcesRelations = relations(sources, ({ many, one }) => ({
	bloats: many(bloats),
	account: one(accounts, {
		fields: [sources.apiId],
		references: [accounts.accountId]
	}),
	destinationChannel: one(destinations, {
		fields: [sources.destination],
		references: [destinations.channelId]
	})
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
	sources: many(sources)
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
	sources: many(sources)
}));

export const bloatsRelations = relations(bloats, ({ one }) => ({
	source: one(sources, {
		fields: [bloats.channelId],
		references: [sources.channelId]
	})
}));

// Type exports
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Bloat = typeof bloats.$inferSelect;
export type NewBloat = typeof bloats.$inferInsert;

// src/lib/server/schema.ts
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const sources = pgTable('sources', {
	channel_id: serial('channel_id').primaryKey(),
	channel_name: text('channel_name').notNull(),
	username: text('username').notNull(),
	bias: text('bias').notNull(),
	invite: text('invite')
});

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;

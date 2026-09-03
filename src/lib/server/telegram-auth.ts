// src/lib/server/telegram-auth.ts
// Shared by both Telegram auth paths: the Login Widget callback
// (routes/(public)/auth/callback/telegram) and the Telegram WebApp bootstrap
// (routes/(public)/auth/webapp), which verify a Telegram user two different
// ways but then need identical find-or-create + admin-sync behavior.
import { appDb } from './db';
import { users, type User } from './app-schema';
import { ADMIN_TELEGRAM_IDS } from '$env/static/private';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const adminTelegramIds = new Set(
	ADMIN_TELEGRAM_IDS.split(',')
		.map((id) => id.trim())
		.filter(Boolean)
		.map(Number)
);

export async function syncTelegramUser(
	telegramId: number,
	profile: { username: string | null; picture: string | null }
): Promise<User> {
	const [existing] = await appDb.select().from(users).where(eq(users.telegramId, telegramId));
	const isAdmin = adminTelegramIds.has(telegramId);

	if (!existing) {
		const id = crypto.randomUUID();
		await appDb.insert(users).values({
			id,
			telegramId,
			username: profile.username,
			picture: profile.picture,
			isAdmin
		});
		const [created] = await appDb.select().from(users).where(eq(users.id, id));
		return created;
	}

	// Keep admin status in sync with ADMIN_TELEGRAM_IDS on every login,
	// mirroring ptb-nn's ADMINS list (which can change independently).
	if (existing.isAdmin !== isAdmin) {
		await appDb.update(users).set({ isAdmin }).where(eq(users.id, existing.id));
		existing.isAdmin = isAdmin;
	}
	return existing;
}

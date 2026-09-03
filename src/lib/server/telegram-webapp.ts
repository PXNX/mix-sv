// src/lib/server/telegram-webapp.ts
// Verifies Telegram Mini App `initData` (window.Telegram.WebApp.initData).
// This is a *different* signing scheme from the Login Widget (see
// auth/callback/telegram): the secret here is HMAC_SHA256("WebAppData", bot_token),
// not SHA256(bot_token) directly. See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
import { TELEGRAM_BOT_TOKEN } from '$env/static/private';
import crypto from 'crypto';

export interface TelegramWebAppUser {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
}

export function verifyTelegramWebAppInitData(
	initData: string,
	maxAgeSeconds = 86400
): TelegramWebAppUser | null {
	const params = new URLSearchParams(initData);
	const hash = params.get('hash');
	if (!hash) return null;

	params.delete('hash');
	const dataCheckString = [...params.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
	const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

	if (computedHash !== hash) return null;

	const authDate = parseInt(params.get('auth_date') || '0', 10);
	if (Date.now() / 1000 - authDate > maxAgeSeconds) return null;

	const userJson = params.get('user');
	if (!userJson) return null;

	try {
		return JSON.parse(userJson) as TelegramWebAppUser;
	} catch {
		return null;
	}
}

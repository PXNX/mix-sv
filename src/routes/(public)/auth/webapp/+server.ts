// src/routes/(public)/auth/webapp/+server.ts
// Called client-side by /webapp with window.Telegram.WebApp.initData, once
// Telegram has injected it into the embedded page. Separate from the Login
// Widget callback because the verification scheme is different (see
// telegram-webapp.ts).
import { json, error } from '@sveltejs/kit';
import { createSession, generateSessionToken } from '$lib/server/auth';
import { syncTelegramUser } from '$lib/server/telegram-auth';
import { verifyTelegramWebAppInitData } from '$lib/server/telegram-webapp';

export const POST = async ({ request, cookies }) => {
	const { initData } = await request.json();

	if (!initData || typeof initData !== 'string') {
		throw error(400, 'Missing initData');
	}

	const tgUser = verifyTelegramWebAppInitData(initData);
	if (!tgUser) {
		throw error(403, 'Invalid or expired initData');
	}

	const user = await syncTelegramUser(tgUser.id, {
		username:
			tgUser.username || `${tgUser.first_name ?? ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
		picture: tgUser.photo_url ?? null
	});

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);

	cookies.set('session', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: session.expiresAt
	});

	return json({ success: true, isAdmin: user.isAdmin });
};

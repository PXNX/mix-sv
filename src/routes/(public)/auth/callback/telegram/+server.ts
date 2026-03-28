import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { createSession, generateSessionToken } from '$lib/server/auth';
import { TELEGRAM_BOT_TOKEN } from '$env/static/private';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const GET = async ({ url, cookies }) => {
	const data = {
		id: url.searchParams.get('id'),
		first_name: url.searchParams.get('first_name'),
		last_name: url.searchParams.get('last_name'),
		username: url.searchParams.get('username'),
		photo_url: url.searchParams.get('photo_url'),
		auth_date: url.searchParams.get('auth_date'),
		hash: url.searchParams.get('hash')
	};

	if (!data.id || !data.hash) {
		throw error(400, 'Missing required fields');
	}

	// Verify Telegram Hash
	const checkString = Object.keys(data)
		.filter((key) => key !== 'hash' && data[key as keyof typeof data])
		.sort()
		.map((key) => `${key}=${data[key as keyof typeof data]}`)
		.join('\n');

	const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
	const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

	if (hmac !== data.hash) {
		throw error(403, 'Invalid hash');
	}

	// Check if auth_date is too old (e.g., > 24 hours)
	const authDate = parseInt(data.auth_date || '0');
	if (Date.now() / 1000 - authDate > 86400) {
		throw error(403, 'Auth date too old');
	}

	const telegramId = parseInt(data.id);
	const result = await db
		.select()
		.from(users)
		.where(eq(users.telegramId, telegramId));

	let user = result[0];

	if (!user) {
		const userId = crypto.randomUUID();
		await db.insert(users).values({
			id: userId,
			telegramId: telegramId,
			username: data.username || `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}`,
			picture: data.photo_url,
			isAdmin: false
		});
		const newResult = await db
			.select()
			.from(users)
			.where(eq(users.id, userId));
		user = newResult[0];
	}

	if (!user) {
		throw error(500, 'Failed to create user');
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);

	cookies.set('session', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: session.expiresAt
	});

	throw redirect(302, '/');
};

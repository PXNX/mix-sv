// @ts-nocheck
import type { PageServerLoad } from './$types';
import { getChannelById } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid channel ID');
	}

	const channel = await getChannelById(id);

	if (!channel) {
		throw error(404, 'Channel not found');
	}

	return {
		channel
	};
};

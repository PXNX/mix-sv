import { getChannelById } from '$lib/db.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const channelId = parseInt(params.id);

	if (isNaN(channelId)) {
		throw error(404, 'Invalid channel ID');
	}

	const channel = await getChannelById(channelId);

	if (!channel) {
		throw error(404, 'Channel not found');
	}

	return {
		channel
	};
};

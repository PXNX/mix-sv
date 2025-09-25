import type { PageServerLoad, Actions } from './$types';
import { searchChannels } from '$lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const name = url.searchParams.get('name') || undefined;
	const bias = url.searchParams.get('bias') || undefined;

	const channels = await searchChannels(name, bias);

	return {
		channels
	};
};

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString() || undefined;
		const bias = data.get('bias')?.toString() || undefined;

		try {
			const channels = await searchChannels(name, bias);
			return {
				success: true,
				channels
			};
		} catch (error) {
			console.error('Search failed:', error);
			return {
				success: false,
				channels: [],
				error: 'Search failed. Please try again.'
			};
		}
	}
};

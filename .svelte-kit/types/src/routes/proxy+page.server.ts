// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { searchChannels } from '$lib/db';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
	const name = url.searchParams.get('name') || undefined;
	const bias = url.searchParams.get('bias') || undefined;

	const channels = await searchChannels(name, bias);

	return {
		channels
	};
};

export const actions = {
	search: async ({ request }: import('./$types').RequestEvent) => {
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
;null as any as Actions;
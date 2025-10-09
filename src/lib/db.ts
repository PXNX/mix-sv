import { sql } from 'bun';
import type { Channel } from '$lib/types';

export async function searchChannels(channel_name?: string, bias?: string): Promise<Channel[]> {
	try {
		let query = sql`
            SELECT channel_id, channel_name, username, bias, invite
            FROM sources
            WHERE 1=1
        `;

		// Build dynamic query based on parameters
		if (channel_name && bias) {
			query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE channel_name ILIKE ${'%' + channel_name + '%'}
                AND bias = ${bias}
                ORDER BY channel_name
            `;
		} else if (channel_name) {
			query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE channel_name ILIKE ${'%' + channel_name + '%'} 
                ORDER BY channel_name
            `;
		} else if (bias) {
			query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE bias = ${bias}
                ORDER BY channel_name
            `;
		} else {
			query = sql`
                SELECT channel_id, channel_name, username, bias,  invite 
                FROM sources
                ORDER BY channel_name
            `;
		}

		const sources = await query;
		return sources as Channel[];
	} catch (error) {
		console.error('Error searching sources:', error);
		throw new Error('Failed to search sources');
	}
}

export async function getChannelById(channel_id: number): Promise<Channel | null> {
	try {
		const result = await sql`
            SELECT channel_id, channel_name, username, bias,  invite
            FROM sources
            WHERE channel_id = ${channel_id}
        `;

		return result.length > 0 ? (result[0] as Channel) : null;
	} catch (error) {
		console.error('Error fetching channel by ID:', error);
		throw new Error('Failed to fetch channel');
	}
}

// Close database connection when needed
export async function closeConnection(): Promise<void> {
	await sql.end();
}

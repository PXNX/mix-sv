//import postgres from 'postgres';
import type { Channel } from './types';
/*
const sql = postgres({
	
}); // will use psql environment variables

export default sql;
*/

// Mock data - replace with actual PostgreSQL queries
const mockChannels: Channel[] = [
	{
		id: 1001,
		name: 'Tech News Daily',
		username: '@technewsdaily',
		bias: '🇺🇸',
		avatar:
			'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&h=100&fit=crop&crop=center',
		inviteLink: 'https://t.me/technewsdaily'
	},
	{
		id: 1002,
		name: 'European Updates',
		username: '@europeupdates',
		bias: '🇪🇺',
		avatar:
			'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=100&h=100&fit=crop&crop=center',
		inviteLink: 'https://t.me/europeupdates'
	},
	{
		id: 1003,
		name: 'Global Perspectives',
		username: '@globalperspectives',
		bias: '🌍',
		avatar:
			'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop&crop=center'
	},
	{
		id: 1004,
		name: 'Asia Pacific News',
		username: '@apacnews',
		bias: '🇯🇵',
		avatar:
			'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&h=100&fit=crop&crop=center',
		inviteLink: 'https://t.me/apacnews'
	},
	{
		id: 1005,
		name: 'Canada Today',
		username: '@canadatoday',
		bias: '🇨🇦',
		avatar:
			'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=100&h=100&fit=crop&crop=center',
		inviteLink: 'https://t.me/canadatoday'
	},
	{
		id: 1006,
		name: 'UK Politics Hub',
		username: '@ukpoliticshub',
		bias: '🇬🇧',
		avatar:
			'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop&crop=center'
	}
];

export async function searchChannels(name?: string, bias?: string): Promise<Channel[]> {
	// Replace this with your PostgreSQL query
	// Example: SELECT * FROM channels WHERE name ILIKE $1 AND bias = $2
	await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate DB delay

	return mockChannels.filter((channel) => {
		const nameMatch =
			!name ||
			channel.name.toLowerCase().includes(name.toLowerCase()) ||
			channel.username.toLowerCase().includes(name.toLowerCase());
		const biasMatch = !bias || channel.bias === bias;
		return nameMatch && biasMatch;
	});
}

export async function getChannelById(id: number): Promise<Channel | null> {
	// Replace this with your PostgreSQL query
	// Example: SELECT * FROM channels WHERE id = $1
	await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate DB delay

	return mockChannels.find((channel) => channel.id === id) || null;
}

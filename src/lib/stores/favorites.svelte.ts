// src/lib/stores/favorites.svelte.ts
const FAVORITES_KEY = 'telegram_channel_favorites';

function createFavoritesStore() {
	let favorites = $state<Set<number>>(new Set());
	let initialized = false;

	function loadFromLocalStorage() {
		if (typeof window === 'undefined') return;

		try {
			const stored = localStorage.getItem(FAVORITES_KEY);
			if (stored) {
				const parsed: number[] = JSON.parse(stored);
				favorites = new Set(parsed);
			}
		} catch (error) {
			console.error('Failed to load favorites from localStorage:', error);
		}
	}

	function saveToLocalStorage() {
		if (typeof window === 'undefined') return;

		try {
			const array = Array.from(favorites);
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(array));
		} catch (error) {
			console.error('Failed to save favorites to localStorage:', error);
		}
	}

	function initialize() {
		if (!initialized && typeof window !== 'undefined') {
			loadFromLocalStorage();
			initialized = true;
		}
	}

	function toggle(channelId: number) {
		initialize();

		if (favorites.has(channelId)) {
			favorites.delete(channelId);
		} else {
			favorites.add(channelId);
		}
		saveToLocalStorage();
	}

	function isFavorite(channelId: number): boolean {
		initialize();
		return favorites.has(channelId);
	}

	function getCount(): number {
		initialize();
		return favorites.size;
	}

	function getIds(): number[] {
		initialize();
		return Array.from(favorites);
	}

	return {
		get count() {
			return getCount();
		},
		get ids() {
			return getIds();
		},
		toggle,
		isFavorite,
		initialize
	};
}

export const favoritesStore = createFavoritesStore();

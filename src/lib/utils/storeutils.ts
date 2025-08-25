import { writable } from 'svelte/store';

export function createPersistentStore<T>(key: string, initial: T) {
	const stored = localStorage.getItem(key);
	const data = stored ? JSON.parse(stored) : initial;
	const store = writable<T>(data);

	store.subscribe((value) => {
		localStorage.setItem(key, JSON.stringify(value));
	});

	return store;
}

export function createPersistentState<T>(
	key: string,
	defaultValue: T,
	serializer = JSON.stringify,
	deserializer = JSON.parse
): [T, (newValue: T) => void] {
	let value: T;
	// Check if localStorage is available (i.e., running in a browser)
	if (typeof localStorage !== 'undefined') {
		try {
			const saved = localStorage.getItem(key);
			value = saved ? deserializer(saved) : defaultValue;
		} catch (e) {
			console.warn(`Could not load ${key} from localStorage, using default:`, e);
			value = defaultValue;
		}
	} else {
		value = defaultValue; // Use default value if localStorage is not available
	}

	function save(newValue: T) {
		// Only save if localStorage is available
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem(key, serializer(newValue));
			} catch (e) {
				console.warn(`Could not save ${key} to localStorage:`, e);
			}
		}
	}
	return [value, save];
}

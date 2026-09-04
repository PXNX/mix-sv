<!-- src/lib/component/ChannelAvatar.svelte -->
<script lang="ts">
	interface Props {
		username?: string | null;
		alt: string;
		avatarUrl?: string | null;
		size?: 'md' | 'lg';
		priority?: boolean;
	}

	let { username = null, alt, avatarUrl = null, size = 'md', priority = false }: Props = $props();

	let loaded = $state(false);
	let currentSource = $state<'avatar' | 'telegram' | 'none'>('avatar');

	const sizeClasses = {
		md: 'size-16',
		lg: 'size-24'
	};

	const textSizes = {
		md: 'text-xl',
		lg: 'text-3xl'
	};

	const containerClass = $derived(`${sizeClasses[size]} rounded-full`);
	const textClass = $derived(textSizes[size]);

	// Clean username and construct Telegram avatar URL
	const cleanUsername = $derived(username?.replace('@', ''));
	const telegramAvatarUrl = $derived(cleanUsername ? `https://t.me/i/userpic/160/${cleanUsername}.jpg` : null);

	// Determine which avatar to display based on current source
	const currentAvatarUrl = $derived(() => {
		if (currentSource === 'avatar' && avatarUrl) {
			return avatarUrl;
		}
		if (currentSource === 'telegram' && telegramAvatarUrl) {
			return telegramAvatarUrl;
		}
		return null;
	});

	// Telegram itself falls back to a colored circle with the peer's initial
	// whenever there's no profile photo - same idea here instead of a broken-
	// image icon, both while a photo is loading and if every source fails.
	const AVATAR_COLORS = ['#e17076', '#faa774', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae'];

	const initial = $derived(alt?.trim()?.[0]?.toUpperCase() || '#');

	const avatarColor = $derived.by(() => {
		const key = username || alt || '';
		let hash = 0;
		for (let i = 0; i < key.length; i++) {
			hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
		}
		return AVATAR_COLORS[hash % AVATAR_COLORS.length];
	});

	function handleImageLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		// Telegram returns 1x1 transparent image for non-existent users
		if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
			handleImageError();
		} else {
			loaded = true;
		}
	}

	function handleImageError() {
		// Try fallback sources in order: avatar -> telegram -> none
		if (currentSource === 'avatar' && telegramAvatarUrl) {
			currentSource = 'telegram';
			loaded = false;
		} else {
			currentSource = 'none';
			loaded = false;
		}
	}

	// Reset state when props change
	$effect(() => {
		if (avatarUrl) {
			currentSource = 'avatar';
		} else if (telegramAvatarUrl) {
			currentSource = 'telegram';
		} else {
			currentSource = 'none';
		}
		loaded = false;
	});
</script>

<div class="relative {containerClass} overflow-hidden shadow-sm">
	<div
		class="absolute inset-0 flex items-center justify-center font-semibold text-white {textClass}"
		style="background-color: {avatarColor}"
	>
		{initial}
	</div>

	{#if currentAvatarUrl()}
		<img
			src={currentAvatarUrl()}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
			class="relative h-full w-full object-cover transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={handleImageLoad}
			onerror={handleImageError}
		/>
	{/if}
</div>

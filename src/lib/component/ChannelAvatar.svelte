<!-- src/lib/components/ChannelAvatar.svelte -->
<script lang="ts">
	import IconChannel from '~icons/fluent/channel-24-regular';
	import IconImageOff from '~icons/fluent/image-off-24-regular';

	interface Props {
		username?: string | null;
		alt: string;
		avatarUrl?: string | null;
		size?: 'md' | 'lg';
		priority?: boolean;
	}

	let { username = null, alt, avatarUrl = null, size = 'md', priority = false }: Props = $props();

	let loaded = $state(false);
	let error = $state(false);
	let currentSource = $state<'avatar' | 'telegram' | 'none'>('avatar');

	const sizeClasses = {
		md: 'size-16',
		lg: 'size-24'
	};

	const iconSizes = {
		md: 'size-7',
		lg: 'size-10'
	};

	const containerClass = $derived(`${sizeClasses[size]} rounded-full`);
	const iconClass = $derived(iconSizes[size]);
	
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

	function handleImageLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		// Telegram returns 1x1 transparent image for non-existent users
		if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
			handleImageError();
		} else {
			loaded = true;
			error = false;
		}
	}

	function handleImageError() {
		// Try fallback sources in order: avatar -> telegram -> none
		if (currentSource === 'avatar' && telegramAvatarUrl) {
			// Avatar failed, try Telegram
			currentSource = 'telegram';
			loaded = false;
			error = false;
		} else if (currentSource === 'telegram' || (currentSource === 'avatar' && !telegramAvatarUrl)) {
			// All sources failed
			currentSource = 'none';
			error = true;
			loaded = false;
		}
	}

	// Reset state when props change
	$effect(() => {
		// Determine initial source
		if (avatarUrl) {
			currentSource = 'avatar';
		} else if (telegramAvatarUrl) {
			currentSource = 'telegram';
		} else {
			currentSource = 'none';
		}
		loaded = false;
		error = false;
	});
</script>

<div class="relative {containerClass} overflow-hidden bg-base-200 shadow-md">
	{#if !loaded && !error && currentSource !== 'none'}
		<div class="absolute inset-0 flex items-center justify-center">
			<IconChannel class="{iconClass} animate-pulse text-base-content/20" />
		</div>
	{/if}

	{#if currentAvatarUrl()}
		<img
			src={currentAvatarUrl()}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
			class="h-full w-full object-cover transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={handleImageLoad}
			onerror={handleImageError}
		/>
	{:else}
		<div class="absolute inset-0 flex items-center justify-center">
			<IconImageOff class="{iconClass} text-error/40" />
		</div>
	{/if}

	{#if error}
		<div class="absolute inset-0 flex items-center justify-center">
			<IconImageOff class="{iconClass} text-error/40" />
		</div>
	{/if}
</div>
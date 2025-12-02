<!-- src/lib/components/ChannelAvatar.svelte -->
<script lang="ts">
	import IconChannel from '~icons/fluent/channel-24-regular';
	import IconImageOff from '~icons/fluent/image-off-24-regular';

	interface Props {
		username: string;
		alt: string;
		size?: 'md' | 'lg';
		priority?: boolean;
	}

	let { username, alt, size = 'md', priority = false }: Props = $props();

	let loaded = $state(false);
	let error = $state(false);

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
	// Using 160px for all sizes to maximize browser caching
	const cleanUsername = $derived(username.replace('@', ''));
	const avatarUrl = $derived(`https://t.me/i/userpic/160/${cleanUsername}.jpg`);
</script>

<div class="relative {containerClass} overflow-hidden bg-base-200 shadow-md">
	{#if !loaded && !error}
		<div class="absolute inset-0 flex items-center justify-center">
			<IconChannel class="{iconClass} animate-pulse text-base-content/20" />
		</div>
	{/if}

	<img
		src={avatarUrl}
		{alt}
		loading={priority ? 'eager' : 'lazy'}
		decoding="async"
		class="h-full w-full object-cover transition-opacity duration-300 {loaded
			? 'opacity-100'
			: 'opacity-0'}"
		onload={(e) => {
			const img = e.currentTarget;
			// Telegram returns 1x1 transparent image for non-existent users
			if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
				error = true;
			} else {
				loaded = true;
			}
		}}
		onerror={() => (error = true)}
	/>

	{#if error}
		<div class="absolute inset-0 flex items-center justify-center">
			<IconImageOff class="{iconClass} text-error/40" />
		</div>
	{/if}
</div>
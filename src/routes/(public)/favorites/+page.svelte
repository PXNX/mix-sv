<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	import type { PageData } from './$types';
	import type { Channel } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	let channels = $state<Channel[]>([]);
	let loading = $state(true);
	let imageLoadedStates = $state<Record<string, boolean>>({});

	const BIAS_MAP: Record<string, string> = {
		'🇺🇦': 'Ukraine',
		'🇷🇺': 'Russia',
		'🇬🇧': 'United Kingdom',
		'🇯🇵': 'Japan',
		'🇨🇦': 'Canada'
	};

	onMount(() => {
		loadFavorites();
	});

	async function loadFavorites() {
		loading = true;
		const favoriteIds = favoritesStore.ids;
		
		if (favoriteIds.length === 0) {
			channels = [];
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/favorites?ids=${favoriteIds.join(',')}`);
			const result = await response.json();
			channels = result.channels || data.channels || [];
		} catch (error) {
			console.error('Failed to load favorites:', error);
			channels = [];
		} finally {
			loading = false;
		}
	}

	function goBack() {
		goto('/');
	}

	function removeFavorite(channelId: number) {
		favoritesStore.toggle(channelId);
		channels = channels.filter(c => c.channel_id !== channelId);
	}

	function handleImageLoad(channelId: string) {
		imageLoadedStates[channelId] = true;
	}

	function getBiasLabel(biasValue: string): string {
		return BIAS_MAP[biasValue] || biasValue;
	}

	const showEmptyState = $derived(!loading && channels.length === 0);
</script>

<svelte:head>
	<title>Favorites - Telegram Channel Search</title>
	<meta name="description" content="Your favorite Telegram channels" />
</svelte:head>

<!-- Header -->
<div class="mb-8 flex items-center justify-between">
	<button
		onclick={goBack}
		class="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white transition-colors hover:border-white/40 hover:bg-white/10"
	>
		<FluentArrowLeft24Regular class="size-4 transition-transform group-hover:-translate-x-1" />
		<span class="text-sm font-medium">Back to Search</span>
	</button>

	<h1 class="text-2xl font-bold text-white">
		Favorites {channels.length > 0 ? `(${channels.length})` : ''}
	</h1>
</div>

<!-- Loading State -->
{#if loading}
	<div class="mb-8 flex justify-center py-8">
		<div class="flex items-center gap-3 text-white/70">
			<span class="loading loading-ring loading-md"></span>
			<span class="text-sm">Loading favorites...</span>
		</div>
	</div>
{/if}

<!-- Favorites List -->
{#if !loading}
	<div class="space-y-3">
		{#each channels as channel (channel.channel_id)}
			<div
				class="group flex items-center gap-4 rounded-lg border border-white/20 bg-white/5 p-4 transition-colors"
			>
				<a
					href={`/channel/${channel.channel_id}`}
					class="flex flex-1 items-center gap-4"
				>
					<!-- Avatar -->
					<div class="relative shrink-0">
						{#if !imageLoadedStates[channel.channel_id]}
							<div class="size-16 animate-pulse rounded-full bg-white/10"></div>
						{/if}
						<img
							src={channel.avatar}
							alt={channel.channel_name}
							class="size-16 rounded-full object-cover {!imageLoadedStates[channel.channel_id]
								? 'absolute inset-0 opacity-0'
								: ''}"
							loading="lazy"
							onload={() => handleImageLoad(channel.channel_id)}
						/>
					</div>

					<!-- Channel Info -->
					<div class="min-w-0 flex-1">
						<h3 class="truncate font-semibold text-white">
							{channel.channel_name}
						</h3>
						<div class="flex items-center gap-2">
							{#if channel.username}
								<p class="text-sm text-white/60">
									@{channel.username}
								</p>
							{/if}
							{#if channel.bias}
								<span class="text-xs text-white/40">•</span>
								<p class="text-sm text-white/50">
									{getBiasLabel(channel.bias)}
								</p>
							{/if}
						</div>
					</div>

					<!-- Arrow -->
					<div class="flex shrink-0 items-center">
						<FluentArrowRight24Regular
							class="size-5 text-white/40 transition-transform group-hover:translate-x-1"
						/>
					</div>
				</a>

				<!-- Remove Button -->
				<button
					onclick={() => removeFavorite(channel.channel_id)}
					class="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
					title="Remove from favorites"
				>
					<FluentDelete24Regular class="size-5" />
				</button>
			</div>
		{/each}

		<!-- Empty State -->
		{#if showEmptyState}
			<div class="rounded-lg border border-white/20 bg-white/5 py-16 text-center">
				<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/5">
					<FluentHeart24Regular class="size-8 text-white/40" />
				</div>
				<h3 class="mb-2 text-lg font-semibold text-white">No favorites yet</h3>
				<p class="mb-4 text-sm text-white/60">Start adding channels to your favorites</p>
				<button
					onclick={goBack}
					class="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
				>
					Browse Channels
				</button>
			</div>
		{/if}
	</div>
{/if}
<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import ChannelAvatar from '$lib/component/ChannelAvatar.svelte';

	import type { PageData } from './$types';
	import type { Channel } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	let channels = $state<Channel[]>([]);
	let loading = $state(true);

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
		favoritesStore.initialize();
		const favoriteIds = favoritesStore.ids;
		
		if (favoriteIds.length === 0) {
			channels = [];
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/favorites?ids=${favoriteIds.join(',')}`);
			const result = await response.json();
			channels = result.channels || [];
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
		{#each channels as channel (channel.channelId)}
			<div class="group relative rounded-lg border border-white/20 bg-white/5 transition-colors hover:border-white/40 hover:bg-white/10">
				<a
					href={`/channel/${channel.channelId}`}
					class="block p-4"
				>
					<div class="flex items-center gap-4">
						<!-- Avatar -->
						<ChannelAvatar 
							username={channel.username} 
							avatarUrl={channel.avatar}
							alt={channel.channelName}
							size="md"
						/>

					<!-- Channel Info -->
					<div class="min-w-0 flex-1">
						<h3 class="truncate font-semibold text-white">
							{channel.channelName}
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
				</div>
			</a>
			
		
			
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
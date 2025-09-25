<script lang="ts">
	import { searchChannels } from '$lib/db.js';
	import type { Channel } from '$lib/types.js';
	import { goto } from '$app/navigation';
	import SimpleIconsTelegram from '~icons/simple-icons/telegram';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiSadButRelievedFace from '~icons/fluent-emoji/sad-but-relieved-face';
	import FluentEmojiWavingHand from '~icons/fluent-emoji/waving-hand';

	let searchTerm = $state('');
	let selectedBias = $state('');
	let searchResults: Channel[] = $state([]);
	let loading = $state(false);

	const biasOptions = [
		{ value: '🇺🇸', label: 'United States' },
		{ value: '🇪🇺', label: 'European Union' },
		{ value: '🇬🇧', label: 'United Kingdom' },
		{ value: '🇯🇵', label: 'Japan' },
		{ value: '🇨🇦', label: 'Canada' },
		{ value: '🌍', label: 'Global' }
	];

	async function performSearch() {
		if (!searchTerm.trim() && !selectedBias) {
			searchResults = [];
			return;
		}

		loading = true;
		try {
			searchResults = await searchChannels(searchTerm, selectedBias);
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			loading = false;
		}
	}

	function selectChannel(channel: Channel) {
		goto(`/channel/${channel.id}`);
	}

	// Auto-search when inputs change
	$effect(() => {
		performSearch();
	});
</script>

<svelte:head>
	<title>Telegram Channel Search</title>
	<meta name="description" content="Search for Telegram channels by name and bias" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-pink-500 via-cyan-400 via-green-400 via-purple-500 to-orange-500 p-3 sm:p-6"
>
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 text-center sm:mb-12">
			<h1 class="mb-3 text-3xl font-bold text-white drop-shadow-lg sm:mb-4 sm:text-4xl">
				Channel Search
			</h1>
			<p class="text-base text-white/90 drop-shadow sm:text-lg">
				Discover Telegram channels from around the world
			</p>

			<!-- Developer Link -->
			<div class="mt-6 flex justify-center">
				<a
					href="https://t.me/nyx_news"
					target="_blank"
					rel="noopener noreferrer"
					class="dev-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/90 hover:text-white sm:px-6 sm:py-3 sm:text-base"
				>
					<SimpleIconsTelegram class="h-4 w-4 sm:h-5 sm:w-5" />
					Developer Channel
				</a>
			</div>
		</div>

		<!-- Search Form -->
		<div class="search-container mb-6 rounded-xl p-4 sm:mb-8 sm:rounded-2xl sm:p-6">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="group">
					<label class="mb-2 block text-sm font-medium text-white/90 drop-shadow">
						Channel Name
					</label>
					<input
						type="text"
						placeholder="Search channels..."
						class="search-input w-full rounded-xl px-3 py-2.5 text-white placeholder-white/70 sm:px-4 sm:py-3"
						bind:value={searchTerm}
					/>
				</div>

				<div class="group">
					<label class="mb-2 block text-sm font-medium text-white/90 drop-shadow"> Region </label>
					<select
						class="search-input w-full rounded-xl px-3 py-2.5 text-white sm:px-4 sm:py-3"
						bind:value={selectedBias}
					>
						<option value="" class="bg-purple-800/90">All Regions</option>
						{#each biasOptions as option}
							<option value={option.value} class="bg-purple-800/90">
								{option.value}
								{option.label}
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Loading State -->
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="loading-pulse text-white">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"
					></div>
				</div>
			</div>
		{/if}

		<!-- Search Results -->
		<div class="space-y-4">
			{#each searchResults as channel (channel.id)}
				<button
					class="channel-card fade-in w-full rounded-xl p-4 text-left sm:rounded-2xl sm:p-6"
					style="view-transition-name: channel-{channel.id}"
					onclick={() => selectChannel(channel)}
				>
					<div class="flex items-center gap-3 sm:gap-6">
						<div class="flex-shrink-0" style="view-transition-name: avatar-{channel.id}">
							<div
								class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/40 sm:h-16 sm:w-16"
							>
								<img src={channel.avatar} alt={channel.name} class="h-full w-full object-cover" />
							</div>
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="mb-1 text-lg font-semibold text-white drop-shadow sm:text-xl">
								{channel.name}
							</h3>
							{#if channel.username}
								<p class="text-xs text-white/80 drop-shadow sm:text-sm">
									@{channel.username}
								</p>
							{/if}
						</div>

						<div class="flex items-center gap-2 sm:gap-4">
							<span class="text-xl sm:text-2xl">
								{channel.bias}
							</span>
							<FluentArrowRight24Regular
								class="h-5 w-5 text-white/70 transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6"
							/>
						</div>
					</div>
				</button>
			{/each}

			{#if !loading && searchResults.length === 0 && (searchTerm || selectedBias)}
				<div class="py-16 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800"
					>
						<svg
							class="h-8 w-8 text-slate-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<p class="mb-2 text-lg text-slate-300">No channels found</p>
					<p class="text-slate-500">Try adjusting your search criteria</p>
				</div>
			{/if}

			{#if !loading && searchResults.length === 0 && !searchTerm && !selectedBias}
				<div class="py-16 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800"
					>
						<svg
							class="h-8 w-8 text-slate-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<p class="mb-2 text-lg text-slate-300">Start exploring</p>
					<p class="text-slate-500">Enter a channel name or select a region to begin</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(html) {
		view-transition-name: root;
	}

	.search-container {
		backdrop-filter: blur(15px);
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.channel-card {
		backdrop-filter: blur(15px);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.channel-card:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
	}

	.search-input {
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.25);
		transition: all 0.2s ease;
	}

	.search-input:focus {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.5);
		outline: none;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
	}

	.dev-link {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		transition: all 0.2s ease;
	}

	.dev-link:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-1px);
	}

	.loading-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.fade-in {
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

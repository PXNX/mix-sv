<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { Channel } from '$lib/types';
	import { enhance } from '$app/forms';
	import SimpleIconsTelegram from '~icons/simple-icons/telegram';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	const BIAS_OPTIONS = [
		{ value: '🇺🇦', label: 'Ukraine', flag: '🇺🇦' },
		{ value: '🇷🇺', label: 'Russia', flag: '🇷🇺' },
		{ value: '🇬🇧', label: 'United Kingdom', flag: '🇬🇧' },
		{ value: '🇯🇵', label: 'Japan', flag: '🇯🇵' },
		{ value: '🇨🇦', label: 'Canada', flag: '🇨🇦' }
	];

	let { data, form }: Props = $props();

	let searchTerm = $state(page.url.searchParams.get('name') || '');
	let selectedBias = $state(page.url.searchParams.get('bias') || '');
	let searchResults: Channel[] = $state(data.channels || []);
	let loading = $state(false);
	let imageLoadedStates = $state<Record<string, boolean>>({});

	$effect(() => {
		if (form?.channels) {
			searchResults = form.channels;
		}
	});

	$effect(() => {
		if (data?.channels) {
			searchResults = data.channels;
		}
	});

	function handleFormSubmit() {
		loading = true;
		return async ({ update }) => {
			await update({ reset: false });
			loading = false;
		};
	}

	function handleImageLoad(channelId: string) {
		imageLoadedStates[channelId] = true;
	}

	function getBiasLabel(biasValue: string): string {
		const option = BIAS_OPTIONS.find((opt) => opt.value === biasValue);
		return option ? option.label : biasValue;
	}

	const showEmptyState = $derived(
		!loading && searchResults.length === 0 && (searchTerm || selectedBias)
	);
</script>

<svelte:head>
	<title>Telegram Channel Search</title>
	<meta name="description" content="Search for Telegram channels by name and region" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Header -->
<header class="mb-12 text-center">
	<h1 class="mb-6 text-3xl font-bold text-white">Telegram Channel Search</h1>

	<a
		href="https://t.me/nyx_news"
		target="_blank"
		rel="noopener noreferrer"
		class="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white transition-colors hover:border-white/40 hover:bg-white/10"
	>
		<SimpleIconsTelegram class="size-4" />
		<span class="text-sm font-medium">NewsMix</span>
	</a>
</header>

<!-- Search Form -->
<div class="mb-8 rounded-lg border border-white/20 bg-white/5 p-6">
	<form method="POST" action="?/search" use:enhance={handleFormSubmit} class="space-y-4">
		<!-- Channel Name Input -->
		<input
			id="channel-name"
			type="text"
			name="name"
			placeholder="Search channels..."
			class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
			bind:value={searchTerm}
			disabled={loading}
		/>

		<!-- Bias Select -->
		<select
			id="bias-select"
			name="bias"
			class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
			bind:value={selectedBias}
			disabled={loading}
		>
			<option value="" class="bg-gray-900 text-white"> 🌐 All Regions </option>
			{#each BIAS_OPTIONS as option}
				<option value={option.value} class="bg-gray-900 text-white">
					{option.flag}
					{option.label}
				</option>
			{/each}
		</select>

		<!-- Submit Button -->
		<div class="flex justify-end">
			<button
				type="submit"
				class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20 disabled:opacity-50"
				disabled={loading}
			>
				<span>Search</span>
				<FluentArrowRight24Regular class="size-5" />
			</button>
		</div>
	</form>
</div>

<!-- Loading State -->
{#if loading}
	<div class="mb-8 flex justify-center py-8">
		<div class="flex items-center gap-3 text-white/70">
			<span class="loading loading-ring loading-md"></span>
			<span class="text-sm">Searching channels...</span>
		</div>
	</div>
{/if}

<!-- Search Results -->
{#if !loading || searchResults.length > 0}
	<div class="space-y-3">
		{#each searchResults as channel (channel.channel_id)}
			<a
				href={`/channel/${channel.channel_id}`}
				class="group block rounded-lg border border-white/20 bg-white/5 p-4 transition-colors hover:border-white/40 hover:bg-white/10"
				style="view-transition-name: channel-{channel.channel_id}"
			>
				<div class="flex items-center gap-4">
					<!-- Avatar -->
					<div class="relative shrink-0" style="view-transition-name: avatar-{channel.channel_id}">
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
				</div>
			</a>
		{/each}

		<!-- Empty State -->
		{#if showEmptyState}
			<div class="rounded-lg border border-white/20 bg-white/5 py-16 text-center">
				<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/5">
					<FluentSearch24Regular class="size-8 text-white/40" />
				</div>
				<h3 class="mb-2 text-lg font-semibold text-white">No channels found</h3>
				<p class="text-sm text-white/60">Try adjusting your search criteria</p>
			</div>
		{/if}
	</div>
{/if}

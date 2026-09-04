<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { Channel } from '$lib/types';
	import { enhance } from '$app/forms';
	import { navigating } from '$app/state';
	import { onMount } from 'svelte';
	import SimpleIconsTelegram from '~icons/simple-icons/telegram';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentErrorCircle24Regular from '~icons/fluent/error-circle-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { PageData, ActionData } from './$types';
	import ChannelAvatar from '$lib/component/ChannelAvatar.svelte';

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

	let searchTerm = $state('');
	let selectedBias = $state('');
	let searchResults: Channel[] = $state(data.channels || []);
	let loading = $state(false);
	let searchError = $state<string | null>(null);
	let favoritesCount = $state(0);

	onMount(() => {
		favoritesStore.initialize();
		favoritesCount = favoritesStore.count;
	});

	// Initialize search params from URL on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			searchTerm = params.get('name') || '';
			selectedBias = params.get('bias') || '';
		}
	});

	$effect(() => {
		if (form?.channels) {
			searchResults = form.channels;
			searchError = form.error || null;
		}
	});

	$effect(() => {
		if (data?.channels) {
			searchResults = data.channels;
		}
	});

	function handleFormSubmit() {
		loading = true;
		searchError = null;
		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
			await update({ reset: false });
			loading = false;
		};
	}



	function getBiasLabel(biasValue: string): string {
		const option = BIAS_OPTIONS.find((opt) => opt.value === biasValue);
		return option ? option.label : biasValue;
	}

	const showEmptyState = $derived(
		!loading && !searchError && searchResults.length === 0 && (searchTerm || selectedBias)
	);
</script>

<svelte:head>
	<title>Telegram Channel Search</title>
	<meta name="description" content="Search for Telegram channels by name and region" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- App bar -->
<header class="tg-panel mb-4 flex items-center justify-between gap-3 px-4 py-3">
	<a
		href="https://t.me/nyx_news"
		target="_blank"
		rel="noopener noreferrer"
		class="flex min-w-0 items-center gap-3"
	>
		<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
			<SimpleIconsTelegram class="size-5" />
		</span>
		<span class="truncate text-lg font-semibold">NewsMix</span>
	</a>

	<div class="flex shrink-0 items-center gap-1">
		{#if data.session && data.user && data.user.isAdmin}
			<a href="/pending" class="btn btn-ghost btn-sm rounded-full">Pending</a>
		{:else if data.session && data.user}
			<a href="/submissions" class="btn btn-ghost btn-sm rounded-full">My submissions</a>
		{/if}

		<a href="/favorites" class="btn btn-ghost btn-sm rounded-full">
			Favorites
			{#if favoritesCount > 0}
				<span class="badge badge-sm badge-primary">{favoritesCount}</span>
			{/if}
		</a>

		{#if data.session && data.user}
			<a href="/auth/logout" class="btn btn-ghost btn-sm rounded-full">Logout</a>
		{:else}
			<a href="/auth/login" class="btn btn-primary btn-sm rounded-full">Login</a>
		{/if}
	</div>
</header>

<!-- Search Form -->
<div class="tg-panel mb-4 p-3">
	<form method="POST" action="?/search" use:enhance={handleFormSubmit} class="space-y-3">
		<!-- Channel Name Input -->
		<label class="relative block">
			<FluentSearch24Regular
				class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-base-content/40"
			/>
			<input
				id="channel-name"
				type="text"
				name="name"
				placeholder="Search channels..."
				class="tg-input rounded-full pl-11"
				bind:value={searchTerm}
				disabled={loading}
			/>
		</label>

		<div class="flex flex-col gap-3 sm:flex-row">
			<!-- Bias Select -->
			<select
				id="bias-select"
				name="bias"
				class="tg-input select rounded-full sm:flex-1"
				bind:value={selectedBias}
				disabled={loading}
			>
				<option value="">🌐 All Regions</option>
				{#each BIAS_OPTIONS as option}
					<option value={option.value}>
						{option.flag}
						{option.label}
					</option>
				{/each}
			</select>

			<!-- Submit Button -->
			<button
				type="submit"
				class="btn btn-primary rounded-full sm:w-auto"
				disabled={loading}
			>
				<span>Search</span>
				<FluentArrowRight24Regular class="size-5" />
			</button>
		</div>
	</form>
</div>

<!-- Error State -->
{#if searchError}
	<div class="alert alert-error mb-4 rounded-box">
		<FluentErrorCircle24Regular class="size-6" />
		<div>
			<h3 class="font-semibold">Error</h3>
			<div class="text-sm opacity-80">{searchError}</div>
		</div>
	</div>
{/if}

<!-- Loading State -->
{#if loading}
	<div class="mb-4 flex justify-center py-8">
		<div class="flex items-center gap-3 text-base-content/70">
			<span class="loading loading-ring loading-md"></span>
			<span class="text-sm">Searching channels...</span>
		</div>
	</div>
{/if}

<!-- Search Results -->
{#if !loading || searchResults.length > 0}
	<div class="tg-panel divide-y divide-base-300/40 overflow-hidden">
		{#each searchResults as channel (channel.channelId)}
			{@const isNavigating = navigating.to?.url.pathname === `/channel/${channel.channelId}`}
			<a
				href={`/channel/${channel.channelId}`}
				class="tg-row group"
				style="view-transition-name: channel-{channel.channelId}"
			>
				<ChannelAvatar
					username={channel.username}
					avatarUrl={channel.avatar}
					alt={channel.channelName}
					size="md"
				/>

				<!-- Channel Info -->
				<div class="min-w-0 flex-1">
					<h3 class="truncate font-semibold">
						{channel.displayName}
					</h3>
					<div class="flex items-center gap-2">
						{#if channel.username}
							<p class="truncate text-sm text-base-content/60">
								@{channel.username}
							</p>
						{/if}
						{#if channel.bias}
							<span class="text-xs text-base-content/40">•</span>
							<p class="truncate text-sm text-base-content/50">
								{getBiasLabel(channel.bias)}
							</p>
						{/if}
					</div>
				</div>

				<!-- Arrow / loading spinner while navigating to this channel -->
				<div class="flex shrink-0 items-center">
					{#if isNavigating}
						<span class="loading loading-spinner loading-sm text-base-content/60"></span>
					{:else}
						<FluentArrowRight24Regular
							class="size-5 text-base-content/30 transition-transform group-hover:translate-x-1"
						/>
					{/if}
				</div>
			</a>
		{/each}

		<!-- Empty State -->
		{#if showEmptyState}
			<div class="py-16 text-center">
				<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-base-300/60">
					<FluentSearch24Regular class="size-8 text-base-content/40" />
				</div>
				<h3 class="mb-2 text-lg font-semibold">No channels found</h3>
				<p class="text-sm text-base-content/60">Try adjusting your search criteria</p>
			</div>
		{/if}
	</div>
{/if}

<!-- Telegram-style floating "compose" button -->
<a
	href="/channel/new"
	class="btn btn-primary btn-circle fixed right-6 bottom-6 z-10 size-14 shadow-lg"
	aria-label="New Channel"
>
	<FluentAdd24Regular class="size-6" />
</a>
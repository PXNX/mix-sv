<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { Channel } from '$lib/types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import SimpleIconsTelegram from '~icons/simple-icons/telegram';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	const SEARCH_DEBOUNCE_MS = 300;
	const BIAS_OPTIONS = [
		{ value: '🇺🇦', label: 'Ukraine' },
		{ value: '🇷🇺', label: 'Russia' },
		{ value: '🇬🇧', label: 'United Kingdom' },
		{ value: '🇯🇵', label: 'Japan' },
		{ value: '🇨🇦', label: 'Canada' }
	];

	let { data, form }: Props = $props();

	let searchTimeout = 0;
	let searchTerm = $state($page.url.searchParams.get('name') || '');
	let selectedBias = $state($page.url.searchParams.get('bias') || '');
	let searchResults: Channel[] = $state(data.channels || []);
	let loading = $state(false);

	// Update results when form data changes
	$effect(() => {
		if (form?.channels) {
			searchResults = form.channels;
		}
	});

	// Update results when page data changes (on navigation)
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

	function debounceSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			document.querySelector('form')?.requestSubmit();
		}, SEARCH_DEBOUNCE_MS);
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
	<h1
		class="mb-4 bg-gradient-to-r from-white via-pink-100 to-blue-100 bg-clip-text text-2xl font-bold text-white md:text-3xl"
	>
		Telegram Channel Search
	</h1>

	<a
		href="https://t.me/nyx_news"
		target="_blank"
		rel="noopener noreferrer"
		class="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-6 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/30"
	>
		<SimpleIconsTelegram class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
		<span class="font-semibold">NewsMix</span>
	</a>
</header>

<!-- Search Form -->
<div class="card mb-8 border border-white/30 bg-white/10 backdrop-blur-md">
	<div class="card-body p-6">
		<form method="POST" action="?/search" use:enhance={handleFormSubmit}>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Channel Name Input -->
				<div class="form-control">
					<label class="label" for="channel-name">
						<span class="label-text flex items-center gap-2 text-lg font-semibold text-white">
						</span>
					</label>
					<input
						id="channel-name"
						type="text"
						name="name"
						placeholder="Search channels..."
						class="input input-lg border-white/40 bg-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-white focus:bg-white/30"
						bind:value={searchTerm}
						oninput={debounceSearch}
						disabled={loading}
					/>
				</div>

				<!-- Region Select -->
				<div class="form-control">
					<label class="label" for="region-select">
						<span class="label-text flex items-center gap-2 text-lg font-semibold text-white">
						</span>
					</label>
					<select
						id="region-select"
						name="bias"
						class="select select-lg border-white/40 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 focus:border-white focus:bg-white/30"
						bind:value={selectedBias}
						onchange={() => document.querySelector('form')?.requestSubmit()}
						disabled={loading}
					>
						<option value="" class="bg-base-300 text-base-content">🌐 Ignore Bias</option>
						{#each BIAS_OPTIONS as option}
							<option value={option.value} class="bg-base-300 text-base-content">
								{option.value}
								{option.label}
							</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Hidden submit button for accessibility -->
			<button type="submit" class="sr-only" aria-label="Submit search">Search</button>
		</form>
	</div>
</div>

<!-- Loading State -->
{#if loading}
	<div class="mb-8 flex justify-center py-8">
		<div
			class="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md"
		>
			<span class="loading loading-ring loading-md"></span>

			<span class="font-medium text-white">Searching channels...</span>
		</div>
	</div>
{/if}

<!-- Search Results -->
{#if !loading || searchResults.length > 0}
	<div class="space-y-4">
		{#each searchResults as channel (channel.channel_id)}
			<a
				href={`/channel/${channel.channel_id}`}
				class="card group overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/20"
				style="view-transition-name: channel-{channel.channel_id}"
			>
				<div class="card-body p-4">
					<div class="flex items-center gap-6">
						<!-- Avatar -->
						<div class="flex-shrink-0" style="view-transition-name: avatar-{channel.channel_id}">
							<div class="avatar">
								<div
									class="size-20 rounded-full ring-4 ring-white/40 ring-offset-4 ring-offset-transparent transition-all duration-300 group-hover:ring-white/60"
								>
									<img
										src={channel.avatar}
										alt={channel.channel_name}
										class="object-cover"
										loading="lazy"
									/>
								</div>
							</div>
						</div>

						<!-- Channel Info -->
						<div class=" flex-grow gap-1">
							<h3
								class="ellipsis truncate text-lg font-bold text-white transition-colors duration-200 group-hover:text-pink-100"
							>
								{channel.channel_name}
							</h3>
							{#if channel.username}
								<p
									class="flex items-center gap-2 text-base text-white/70 transition-colors duration-200 group-hover:text-white/90"
								>
									@{channel.username}
								</p>
							{/if}
						</div>

						<!-- Region Badge and Arrow -->
						<div class="flex flex-shrink-0 items-center gap-6">
							{#if channel.bias}
								<div
									class="rounded-lg border border-white/40 bg-white/20 px-2 py-1 backdrop-blur-sm transition-all duration-300 group-hover:border-white/60 group-hover:bg-white/30"
								>
									<span class="text-xl">{channel.bias}</span>
								</div>
							{/if}

							<FluentArrowRight24Regular
								class="size-8 text-white/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white"
							/>
						</div>
					</div>
				</div>
			</a>
		{/each}

		<!-- Empty State -->
		{#if showEmptyState}
			<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
				<div class="card-body py-20 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
					>
						<svg
							class="h-12 w-12 text-white/60"
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
					<h3 class="mb-3 text-2xl font-bold text-white">No channels found</h3>
					<p class="text-lg text-white/70">
						Try adjusting your search criteria or explore different regions
					</p>
				</div>
			</div>
		{/if}
	</div>
{/if}

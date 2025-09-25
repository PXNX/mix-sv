<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { Channel } from '$lib/types';
	import { goto } from '$app/navigation';
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
		{ value: '🇺🇸', label: 'United States' },
		{ value: '🇪🇺', label: 'European Union' },
		{ value: '🇬🇧', label: 'United Kingdom' },
		{ value: '🇯🇵', label: 'Japan' },
		{ value: '🇨🇦', label: 'Canada' },
		{ value: '🌍', label: 'Global' }
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
			await update();
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

<div class="from-primary via-secondary via-accent to-warning min-h-screen bg-gradient-to-br">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<header class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
				Telegram Channel Search
			</h1>
			<a
				href="https://t.me/nyx_news"
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-link text-info hover:text-info-content gap-2 no-underline"
			>
				<SimpleIconsTelegram class="h-5 w-5" />
				NewsMix
			</a>
		</header>

		<!-- Search Form -->
		<div class="card bg-base-100/10 mb-8 border border-white/20 shadow-2xl backdrop-blur-sm">
			<div class="card-body">
				<form method="POST" action="?/search" use:enhance={handleFormSubmit}>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<!-- Channel Name Input -->
						<div class="form-control">
							<label class="label" for="channel-name">
								<span class="label-text font-medium text-white">Channel Name</span>
							</label>
							<input
								id="channel-name"
								type="text"
								name="name"
								placeholder="Search channels..."
								class="input input-bordered border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-white focus:bg-white/30"
								bind:value={searchTerm}
								oninput={debounceSearch}
							/>
						</div>

						<!-- Region Select -->
						<div class="form-control">
							<label class="label" for="region-select">
								<span class="label-text font-medium text-white">Region</span>
							</label>
							<select
								id="region-select"
								name="bias"
								class="select select-bordered border-white/30 bg-white/20 text-white focus:border-white focus:bg-white/30"
								bind:value={selectedBias}
								onchange={() => document.querySelector('form')?.requestSubmit()}
							>
								<option value="" class="bg-base-300 text-base-content">All Regions</option>
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
			<div class="flex justify-center py-16">
				<div class="loading loading-spinner loading-lg text-white"></div>
			</div>
		{/if}

		<!-- Search Results -->
		{#if !loading}
			<div class="space-y-4">
				{#each searchResults as channel (channel.channel_id)}
					<a
						href={`/channel/${channel.channel_id}`}
						class="card bg-base-100/10 hover:bg-base-100/20 group border border-white/20 backdrop-blur-sm transition-all duration-200 hover:border-white/40"
						style="view-transition-name: channel-{channel.channel_id}"
					>
						<div class="card-body">
							<div class="flex items-center gap-4">
								<!-- Avatar -->
								<div
									class="flex-shrink-0"
									style="view-transition-name: avatar-{channel.channel_id}"
								>
									<div class="avatar">
										<div
											class="ring-offset-base-100 h-16 w-16 rounded-full ring ring-white/40 ring-offset-2"
										>
											<img src={channel.avatar} alt={channel.channel_name} class="object-cover" />
										</div>
									</div>
								</div>

								<!-- Channel Info -->
								<div class="min-w-0 flex-grow">
									<h3 class="card-title mb-1 truncate text-xl text-white">
										{channel.channel_name}
									</h3>
									{#if channel.username}
										<p class="text-sm text-white/80">@{channel.username}</p>
									{/if}
								</div>

								<!-- Region Badge and Arrow -->
								<div class="flex flex-shrink-0 items-center gap-4">
									<div class="badge badge-lg border-white/40 bg-white/20 p-4 text-2xl text-white">
										{channel.bias}
									</div>
									<FluentArrowRight24Regular
										class="h-6 w-6 text-white/70 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
									/>
								</div>
							</div>
						</div>
					</a>
				{/each}

				<!-- Empty State -->
				{#if showEmptyState}
					<div class="card bg-base-100/10 border border-white/20 backdrop-blur-sm">
						<div class="card-body py-16 text-center">
							<div
								class="bg-base-300/50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
							>
								<svg
									class="h-8 w-8 text-white/50"
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
							<h3 class="mb-2 text-xl font-semibold text-white">No channels found</h3>
							<p class="text-white/70">Try adjusting your search criteria</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom styles for better gradient integration */
	.input:focus,
	.select:focus {
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
	}
</style>

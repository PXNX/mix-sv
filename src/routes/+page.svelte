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

	let searchTimeout = 0;

	let { data, form }: Props = $props();

	let searchTerm = $state($page.url.searchParams.get('name') || '');
	let selectedBias = $state($page.url.searchParams.get('bias') || '');
	let searchResults: Channel[] = $state(data.channels || []);
	let loading = $state(false);

	const biasOptions = [
		{ value: '🇺🇸', label: 'United States' },
		{ value: '🇪🇺', label: 'European Union' },
		{ value: '🇬🇧', label: 'United Kingdom' },
		{ value: '🇯🇵', label: 'Japan' },
		{ value: '🇨🇦', label: 'Canada' },
		{ value: '🌍', label: 'Global' }
	];

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

	function handleSubmit() {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Telegram Channel Search</title>
	<meta name="description" content="Search for Telegram channels by name and bias" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-pink-500 via-green-400 via-purple-500 to-orange-500 p-4"
>
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 text-center sm:mb-12">
			<h1 class="mb-3 text-3xl font-bold text-white drop-shadow-lg sm:mb-4 sm:text-4xl">
				Telegram Channel Search
			</h1>
			<a
				href="https://t.me/nyx_news"
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-row items-center gap-1 p-1 font-semibold text-cyan-400/90 hover:text-cyan-400 sm:text-base"
			>
				<SimpleIconsTelegram class="size-5 " />
				NewsMix
			</a>
		</div>

		<!-- Search Form -->
		<form
			method="POST"
			action="?/search"
			use:enhance={handleSubmit}
			class="border-t border-b border-white/10 sm:rounded-2xl sm:border-none sm:p-6"
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="group">
					<label class="mb-2 block text-sm font-medium text-white/90 drop-shadow">
						Channel Name
						<input
							type="text"
							name="name"
							placeholder="Search channels..."
							class="search-input w-full rounded-xl px-3 py-2.5 text-white placeholder-white/70 sm:px-4 sm:py-3"
							bind:value={searchTerm}
							oninput={() => {
								// Auto-submit on input change with debounce
								clearTimeout(searchTimeout);
								searchTimeout = setTimeout(() => {
									if (typeof document !== 'undefined') {
										document.querySelector('form')?.requestSubmit();
									}
								}, 300);
							}}
						/>
					</label>
				</div>

				<div class="group">
					<label class="mb-2 block text-sm font-medium text-white/90 drop-shadow">
						Region
						<select
							name="bias"
							class="search-input w-full rounded-xl px-3 py-2.5 text-white sm:px-4 sm:py-3"
							bind:value={selectedBias}
							onchange={() => {
								if (typeof document !== 'undefined') {
									document.querySelector('form')?.requestSubmit();
								}
							}}
						>
							<option value="" class="bg-purple-800/90">All Regions</option>
							{#each biasOptions as option}
								<option value={option.value} class="bg-purple-800/90">
									{option.value}
									{option.label}
								</option>
							{/each}
						</select>
					</label>
				</div>
			</div>

			<!-- Hidden submit button for accessibility -->
			<button type="submit" class="sr-only">Search</button>
		</form>

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
			{#each searchResults as channel (channel.channel_id)}
				<a
					class=" fade-in w-full rounded-xl p-4 text-left sm:rounded-2xl sm:p-6"
					style="view-transition-name: channel-{channel.channel_id}"
					href={`/channel/${channel.channel_id}`}
				>
					<div class="flex items-center gap-3 sm:gap-6">
						<div class="flex-shrink-0" style="view-transition-name: avatar-{channel.channel_id}">
							<div
								class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/40 sm:h-16 sm:w-16"
							>
								<img
									src={channel.avatar}
									alt={channel.channel_name}
									class="h-full w-full object-cover"
								/>
							</div>
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="mb-1 text-lg font-semibold text-white drop-shadow sm:text-xl">
								{channel.channel_name}
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
				</a>
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
		</div>
	</div>
</div>

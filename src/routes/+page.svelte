<script lang="ts">
	import { searchChannels } from '$lib/db.js';
	import type { Channel } from '$lib/types.js';
	import { goto } from '$app/navigation';

	let searchTerm = $state('');
	let selectedBias = $state('');
	let searchResults: Channel[] = $state([]);
	let loading = $state(false);

	const biasOptions = ['🇺🇸', '🇪🇺', '🇬🇧', '🇯🇵', '🇨🇦', '🌍'];

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
</svelte:head>

<!-- Search Form -->
<div class="card bg-base-200 mb-6 shadow-xl">
	<div class="card-body">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Channel Name</span>

					<input
						type="text"
						placeholder="Search by name or username..."
						class="input input-bordered w-full"
						bind:value={searchTerm}
					/>
				</label>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Bias (Country/Region)</span>

					<select class="select select-bordered w-full" bind:value={selectedBias}>
						<option value="">All Regions</option>
						{#each biasOptions as bias}
							<option value={bias}>{bias}</option>
						{/each}
					</select>
				</label>
			</div>
		</div>
	</div>
</div>

<!-- Loading State -->
{#if loading}
	<div class="flex justify-center py-8">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}

<!-- Search Results -->
<div class="space-y-4">
	{#each searchResults as channel (channel.id)}
		<button
			class="card bg-base-100 channel-card w-full cursor-pointer text-left shadow-lg transition-all duration-200 hover:shadow-xl"
			style="view-transition-name: channel-{channel.id}"
			onclick={() => selectChannel(channel)}
		>
			<div class="card-body">
				<div class="flex items-center space-x-4">
					<div class="avatar channel-avatar" style="view-transition-name: avatar-{channel.id}">
						<div class="w-16 rounded-full">
							<img src={channel.avatar} alt={channel.name} />
						</div>
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-semibold">{channel.name}</h3>
						<p class="text-base-content/70">{channel.username}</p>
					</div>
					<div class="text-2xl">{channel.bias}</div>
					<svg
						class="text-base-content/50 h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
						></path>
					</svg>
				</div>
			</div>
		</button>
	{/each}

	{#if !loading && searchResults.length === 0 && (searchTerm || selectedBias)}
		<div class="py-8 text-center">
			<p class="text-base-content/70">No channels found matching your criteria.</p>
		</div>
	{/if}

	{#if !loading && searchResults.length === 0 && !searchTerm && !selectedBias}
		<div class="py-8 text-center">
			<p class="text-base-content/70">Enter search terms to find channels.</p>
		</div>
	{/if}
</div>

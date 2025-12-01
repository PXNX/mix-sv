<!-- src/routes/channel/new/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentCheckmark24Regular from '~icons/fluent/checkmark-24-regular';
	import FluentErrorCircle24Regular from '~icons/fluent/error-circle-24-regular';
	import FluentInfo24Regular from '~icons/fluent/info-24-regular';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const BIAS_OPTIONS = [
		{ value: '🇺🇦', label: 'Ukraine', flag: '🇺🇦' },
		{ value: '🇷🇺', label: 'Russia', flag: '🇷🇺' },
		{ value: '🇬🇧', label: 'United Kingdom', flag: '🇬🇧' },
		{ value: '🇯🇵', label: 'Japan', flag: '🇯🇵' },
		{ value: '🇨🇦', label: 'Canada', flag: '🇨🇦' }
	];

	let channelName = $state(form?.channelName || '');
	let username = $state(form?.username || '');
	let bias = $state(form?.bias || '');
	let invite = $state(form?.invite || '');
	let avatar = $state(form?.avatar || '');
	let loading = $state(false);
	let showSuccess = $state(false);

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			// Reset form
			channelName = '';
			username = '';
			bias = '';
			invite = '';
			avatar = '';
			
			// Hide success message after 5 seconds
			setTimeout(() => {
				showSuccess = false;
			}, 5000);
		}
	});

	function handleFormSubmit() {
		loading = true;
		return async ({ update }) => {
			await update({ reset: false });
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Add New Channel - Telegram Channel Search</title>
	<meta name="description" content="Submit a new Telegram channel for review" />
</svelte:head>

<!-- Header -->
<header class="mb-8">
	<a
		href="/"
		class="group mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="size-5" />
		<span class="text-sm font-medium">Back to Search</span>
	</a>

	<h1 class="mb-2 text-3xl font-bold text-white">Add New Channel</h1>
	<p class="text-white/60">Submit a Telegram channel for admin review and approval</p>
</header>

<!-- Success Message -->
{#if showSuccess}
	<div class="alert alert-success mb-6 border-green-500/20 bg-green-500/10">
		<FluentCheckmark24Regular class="size-6 text-green-400" />
		<div>
			<h3 class="font-semibold text-green-400">Success!</h3>
			<div class="text-sm text-green-300/80">{form?.message}</div>
		</div>
	</div>
{/if}

<!-- Error Message -->
{#if form?.error}
	<div class="alert alert-error mb-6 border-red-500/20 bg-red-500/10">
		<FluentErrorCircle24Regular class="size-6 text-red-400" />
		<div>
			<h3 class="font-semibold text-red-400">Error</h3>
			<div class="text-sm text-red-300/80">{form.error}</div>
		</div>
	</div>
{/if}

<!-- Info Box -->
<div class="alert mb-6 border-blue-500/20 bg-blue-500/10">
	<FluentInfo24Regular class="size-6 text-blue-400" />
	<div class="text-sm text-blue-300/80">
		<strong class="text-blue-400">Note:</strong> Your submission will be reviewed by an admin before
		being added to the channel list. Please ensure all information is accurate.
	</div>
</div>

<!-- Form -->
<div class="rounded-lg border border-white/20 bg-white/5 p-6">
	<form method="POST" action="?/create" use:enhance={handleFormSubmit} class="space-y-6">
		<!-- Channel Name -->
		<div>
			<label for="channel-name" class="mb-2 block text-sm font-medium text-white">
				Channel Name <span class="text-red-400">*</span>
			</label>
			<input
				id="channel-name"
				type="text"
				name="channelName"
				placeholder="e.g., BBC News"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
				bind:value={channelName}
				disabled={loading}
				required
			/>
		</div>

		<!-- Username -->
		<div>
			<label for="username" class="mb-2 block text-sm font-medium text-white">
				Username <span class="text-red-400">*</span>
			</label>
			<input
				id="username"
				type="text"
				name="username"
				placeholder="e.g., bbcnews (without @)"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
				bind:value={username}
				disabled={loading}
				required
			/>
			<p class="mt-1 text-xs text-white/50">Enter the username without the @ symbol</p>
		</div>

		<!-- Region/Bias -->
		<div>
			<label for="bias" class="mb-2 block text-sm font-medium text-white">
				Region <span class="text-red-400">*</span>
			</label>
			<select
				id="bias"
				name="bias"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
				bind:value={bias}
				disabled={loading}
				required
			>
				<option value="" class="bg-gray-900 text-white">Select a region</option>
				{#each BIAS_OPTIONS as option}
					<option value={option.value} class="bg-gray-900 text-white">
						{option.flag}
						{option.label}
					</option>
				{/each}
			</select>
		</div>

		<!-- Invite Hash (Optional) -->
		<div>
			<label for="invite" class="mb-2 block text-sm font-medium text-white"> Invite Link </label>
			<input
				id="invite"
				type="text"
				name="invite"
				placeholder="e.g., https://t.me/+AbCdEfGhIjK or just the hash"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
				bind:value={invite}
				disabled={loading}
			/>
			<p class="mt-1 text-xs text-white/50">
				Only needed for private channels. Paste the full invite link or just the hash.
			</p>
		</div>

		<!-- Avatar URL (Optional) -->
		<div>
			<label for="avatar" class="mb-2 block text-sm font-medium text-white"> Avatar URL </label>
			<input
				id="avatar"
				type="url"
				name="avatar"
				placeholder="https://example.com/avatar.jpg"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none"
				bind:value={avatar}
				disabled={loading}
			/>
			<p class="mt-1 text-xs text-white/50">
				Optional: Direct link to the channel's avatar image
			</p>
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end gap-3 pt-4">
			<a
				href="/"
				class="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
			>
				Cancel
			</a>
			<button
				type="submit"
				class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20 disabled:opacity-50"
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-spinner loading-sm"></span>
					<span>Submitting...</span>
				{:else}
					<FluentCheckmark24Regular class="size-5" />
					<span>Submit for Review</span>
				{/if}
			</button>
		</div>
	</form>
</div>
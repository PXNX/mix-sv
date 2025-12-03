<!-- src/routes/channel/new/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentCheckmark24Regular from '~icons/fluent/checkmark-24-regular';
	import FluentInfo24Regular from '~icons/fluent/info-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentQuestionCircle24Regular from '~icons/fluent/question-circle-24-regular';
	import { channelSchema } from './schema';
	import type { PageData } from './$types';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	const BIAS_OPTIONS = [
		{ value: '🇺🇦', label: 'Ukraine', flag: '🇺🇦' },
		{ value: '🇷🇺', label: 'Russia', flag: '🇷🇺' },
		{ value: '🇬🇧', label: 'United Kingdom', flag: '🇬🇧' },
		{ value: '🇯🇵', label: 'Japan', flag: '🇯🇵' },
		{ value: '🇨🇦', label: 'Canada', flag: '🇨🇦' }
	];

	let showSuccess = $state(false);
	let successMessage = $state('');
	let showChannelIdHelp = $state(false);
	let channelLinkInput = $state('');

	const { form, errors, enhance, delayed, message, submitting } = superForm(data.form, {
		validators: valibotClient(channelSchema),
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.message) {
				successMessage = form.message;
				showSuccess = true;
				setTimeout(() => {
					showSuccess = false;
				}, 5000);
			}
		}
	});

	// Initialize bloats array if not present
	if (!$form.bloats) {
		$form.bloats = [];
	}

	let newBloatPattern = $state('');

	// Handle URL parameters from share target
	onMount(() => {
		const urlParams = page.url.searchParams;
		const channelId = urlParams.get('channelId');
		const username = urlParams.get('username');
		const channelName = urlParams.get('channelName');

		if (channelId) {
			$form.channelId = channelId;
		}
		if (username) {
			$form.username = username;
		}
		if (channelName) {
			$form.channelName = channelName;
		}
	});

	function addBloat() {
		const pattern = newBloatPattern.trim();
		if (pattern && !$form.bloats.includes(pattern)) {
			$form.bloats = [...$form.bloats, pattern];
			newBloatPattern = '';
		}
	}

	function removeBloat(index: number) {
		$form.bloats = $form.bloats.filter((_, i) => i !== index);
	}

	function extractChannelId() {
		const link = channelLinkInput.trim();
		if (!link) return;

		// Format 1: https://t.me/c/1234567890/123 (private channel with message)
		let match = link.match(/t\.me\/c\/(\d+)/);
		if (match) {
			$form.channelId = `-100${match[1]}`;
			channelLinkInput = '';
			return;
		}

		// Format 2: Just the numeric ID (with or without -100 prefix)
		match = link.match(/^-?100(\d+)$/);
		if (match) {
			$form.channelId = `-100${match[1]}`;
			channelLinkInput = '';
			return;
		}

		// Format 3: Just numbers
		match = link.match(/^(\d+)$/);
		if (match) {
			$form.channelId = `-100${match[1]}`;
			channelLinkInput = '';
			return;
		}

		// Format 4: Public channel username - https://t.me/username
		match = link.match(/t\.me\/([a-zA-Z0-9_]+)/);
		if (match && match[1] !== 'c') {
			$form.username = match[1];
			channelLinkInput = '';
			return;
		}

		alert(
			'Could not extract channel ID from the provided link. Please try copying a message link from the channel.'
		);
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
	<p class="text-white/60">
		{data.isAdmin
			? 'Create a new channel directly'
			: 'Submit a Telegram channel for admin review and approval'}
	</p>
</header>

<!-- Success Message -->
{#if showSuccess && successMessage}
	<div
		class="alert alert-success animate-in fade-in slide-in-from-top-2 mb-6 border-green-500/20 bg-green-500/10 duration-300"
	>
		<FluentCheckmark24Regular class="size-6 text-green-400" />
		<div>
			<h3 class="font-semibold text-green-400">Success!</h3>
			<div class="text-sm text-green-300/80">{successMessage}</div>
		</div>
	</div>
{/if}

<!-- Loading Overlay -->
{#if $submitting}
	<div class="alert mb-6 animate-pulse border-blue-500/20 bg-blue-500/10">
		<span class="loading loading-spinner loading-md text-blue-400"></span>
		<div>
			<h3 class="font-semibold text-blue-400">Processing...</h3>
			<div class="text-sm text-blue-300/80">
				{data.isAdmin ? 'Creating channel...' : 'Submitting for review...'}
			</div>
		</div>
	</div>
{/if}

<!-- Info Box -->
{#if !data.isAdmin}
	<div class="alert mb-6 border-blue-500/20 bg-blue-500/10">
		<FluentInfo24Regular class="size-6 text-blue-400" />
		<div class="text-sm text-blue-300/80">
			<strong class="text-blue-400">Note:</strong> Your submission will be reviewed by an admin before
			being added to the channel list. Please ensure all information is accurate.
		</div>
	</div>
{/if}

<!-- Form -->
<div class="rounded-lg border border-white/20 bg-white/5 p-6">
	<form method="POST" action="?/create" use:enhance class="space-y-6">
		<!-- Channel ID with Helper -->
		<div>
			<div class="mb-2 flex items-center gap-2">
				<label for="channel-id" class="text-sm font-medium text-white">
					Channel ID <span class="text-red-400">*</span>
				</label>
				<button
					type="button"
					class="text-white/60 hover:text-white"
					onclick={() => (showChannelIdHelp = !showChannelIdHelp)}
					title="How to find Channel ID"
				>
					<FluentQuestionCircle24Regular class="size-4" />
				</button>
			</div>

			{#if showChannelIdHelp}
				<div class="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
					<h4 class="mb-2 text-sm font-semibold text-blue-400">How to Find the Channel ID:</h4>
					<ol class="mb-3 space-y-1 text-xs text-blue-300/80">
						<li>1. Open the Telegram channel in your desktop or web app</li>
						<li>2. Click on any message to open it</li>
						<li>3. Copy the message link (right-click → Copy Link)</li>
						<li>4. Paste the link below to extract the channel ID</li>
					</ol>
					<p class="mb-3 text-xs text-blue-400/70">
						The link will look like: <code class="rounded bg-blue-500/10 px-1"
							>https://t.me/c/1234567890/123</code
						>
					</p>

					<div class="flex gap-2">
						<input
							type="text"
							placeholder="Paste message link here (e.g., https://t.me/c/1234567890/123)"
							class="flex-1 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-500/40 focus:outline-none"
							bind:value={channelLinkInput}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									extractChannelId();
								}
							}}
						/>
						<button
							type="button"
							class="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20"
							onclick={extractChannelId}
						>
							Extract ID
						</button>
					</div>
				</div>
			{/if}

			<input
				id="channel-id"
				type="text"
				name="channelId"
				placeholder="e.g., -1001234567890"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-mono text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.channelId}
				bind:value={$form.channelId}
				disabled={$submitting}
			/>
			{#if $errors.channelId}
				<p class="mt-1 text-xs text-red-400">{$errors.channelId}</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">
					The unique numeric ID of the channel (usually starts with -100)
				</p>
			{/if}
		</div>

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
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.channelName}
				bind:value={$form.channelName}
				disabled={$submitting}
			/>
			{#if $errors.channelName}
				<p class="mt-1 text-xs text-red-400">{$errors.channelName}</p>
			{/if}
		</div>

		<!-- Region/Bias -->
		<div>
			<label for="bias" class="mb-2 block text-sm font-medium text-white">
				Region <span class="text-red-400">*</span>
			</label>
			<select
				id="bias"
				name="bias"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.bias}
				bind:value={$form.bias}
				disabled={$submitting}
			>
				<option value="" class="bg-gray-900 text-white">Select a bias</option>
				{#each BIAS_OPTIONS as option}
					<option value={option.value} class="bg-gray-900 text-white">
						{option.flag}
						{option.label}
					</option>
				{/each}
			</select>
			{#if $errors.bias}
				<p class="mt-1 text-xs text-red-400">{$errors.bias}</p>
			{/if}
		</div>

		<div>
			<label for="username" class="mb-2 block text-sm font-medium text-white">
				Username <span class="text-xs text-white/50">(Optional)</span>
			</label>
			<input
				id="username"
				type="text"
				name="username"
				placeholder="e.g., bbcnews (without @)"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.username}
				bind:value={$form.username}
				disabled={$submitting}
			/>
			{#if $errors.username}
				<p class="mt-1 text-xs text-red-400">{$errors.username}</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">
					For public channels only. Leave empty for private channels.
				</p>
			{/if}
		</div>

		<!-- Invite Link -->
		<div>
			<label for="invite" class="mb-2 flex items-baseline gap-2 text-sm font-medium text-white">
				<span>Invite Link</span>
				{#if !$form.username || $form.username.trim() === ''}
					<span class="text-red-400">*</span>
					<span class="text-xs font-normal text-yellow-400">(Required for private channels)</span>
				{/if}
			</label>
			<input
				id="invite"
				type="text"
				name="invite"
				placeholder="e.g., https://t.me/+AbCdEfGhIjK or just the hash"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.invite}
				class:border-yellow-500={!$form.username || $form.username.trim() === ''}
				bind:value={$form.invite}
				disabled={$submitting}
			/>
			{#if $errors.invite}
				<p class="mt-1 text-xs text-red-400">{$errors.invite}</p>
			{:else if !$form.username || $form.username.trim() === ''}
				<p class="mt-1 text-xs text-yellow-400">
					⚠️ This field is required when no username is provided (private channel).
				</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">
					Only needed for private channels. Paste the full invite link or just the hash.
				</p>
			{/if}
		</div>

		<!-- Bloats Section -->
		<div class="border-t border-white/10 pt-6">
			<label class="mb-3 block text-sm font-medium text-white">
				Bloat Patterns
				<span class="ml-2 text-xs font-normal text-white/60"
					>(Optional regex patterns to filter ads/footers)</span
				>
			</label>

			<!-- Add new pattern -->
			<div class="mb-4 flex gap-2">
				<input
					type="text"
					placeholder="Enter regex pattern, e.g., Subscribe to our channel|Join us on"
					class="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
					bind:value={newBloatPattern}
					disabled={$submitting}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addBloat();
						}
					}}
				/>
				<button
					type="button"
					class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:border-white/40 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={addBloat}
					disabled={$submitting || !newBloatPattern.trim()}
				>
					<FluentAdd24Regular class="size-5" />
					<span>Add</span>
				</button>
			</div>

			<p class="mb-3 text-xs text-white/50">
				Add regex patterns to automatically remove advertisements or repetitive footers from
				messages.
			</p>

			<!-- Hidden input for form submission -->
			{#each $form.bloats as pattern, i}
				<input type="hidden" name="bloats" value={pattern} />
			{/each}

			<!-- List of patterns -->
			{#if $form.bloats.length > 0}
				<div class="space-y-2">
					{#each $form.bloats as pattern, index}
						<div
							class="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
						>
							<code class="flex-1 text-sm break-all text-green-400">{pattern}</code>
							<button
								type="button"
								class="text-white/40 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
								onclick={() => removeBloat(index)}
								disabled={$submitting}
								title="Remove pattern"
							>
								<FluentDelete24Regular class="size-5" />
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-center text-sm text-white/50"
				>
					No bloat patterns added yet. Add patterns above to filter unwanted content.
				</div>
			{/if}
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end border-t border-white/10 pt-6">
			<button
				type="submit"
				class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={$submitting}
			>
				{#if $submitting}
					<span class="loading loading-spinner loading-sm"></span>
					<span>Submitting...</span>
				{:else}
					<FluentCheckmark24Regular class="size-5" />
					<span>{data.isAdmin ? 'Create Channel' : 'Submit for Review'}</span>
				{/if}
			</button>
		</div>
	</form>
</div>

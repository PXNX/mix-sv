<!-- src/routes/channel/[id]/edit/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentCheckmark24Regular from '~icons/fluent/checkmark-24-regular';
	import FluentInfo24Regular from '~icons/fluent/info-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import { channelSchema } from './schema.js';

	let { data } = $props();

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: valibotClient(channelSchema)
	});

	const BIAS_OPTIONS = [
		{ value: '🇺🇦', label: 'Ukraine', flag: '🇺🇦' },
		{ value: '🇷🇺', label: 'Russia', flag: '🇷🇺' },
		{ value: '🇬🇧', label: 'United Kingdom', flag: '🇬🇧' },
		{ value: '🇯🇵', label: 'Japan', flag: '🇯🇵' },
		{ value: '🇨🇦', label: 'Canada', flag: '🇨🇦' }
	];

	// Initialize bloats array if not present
	if (!$form.bloats) {
		$form.bloats = [];
	}

	let newBloatPattern = $state('');

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

	// Get the original data to compare against
	const originalData = {
		channel_name: data.channel.channel_name,
		username: data.channel.username,
		bias: data.channel.bias,
		invite: data.channel.invite || '',
		avatar: data.channel.avatar || '',
		bloats: data.existingBloats || []
	};

	// Get pending edit data if it exists
	const pendingData = data.pendingEdit
		? {
				channel_name: data.pendingEdit.channelName || data.channel.channel_name,
				username: data.pendingEdit.username || data.channel.username,
				bias: data.pendingEdit.bias || data.channel.bias,
				invite: data.pendingEdit.invite || '',
				avatar: data.pendingEdit.avatar || '',
				bloats: (() => {
					try {
						return data.pendingEdit.bloats ? JSON.parse(data.pendingEdit.bloats) : [];
					} catch {
						return [];
					}
				})()
		  }
		: null;

	// Check if current form values differ from both original and pending data
	const hasChanges = $derived(() => {
		const current = {
			channel_name: $form.channel_name?.trim() || '',
			username: $form.username?.trim() || '',
			bias: $form.bias || '',
			invite: $form.invite?.trim() || '',
			avatar: $form.avatar?.trim() || '',
			bloats: $form.bloats || []
		};

		// Helper to compare arrays
		const arraysEqual = (a: string[], b: string[]) => {
			if (a.length !== b.length) return false;
			const sortedA = [...a].sort();
			const sortedB = [...b].sort();
			return sortedA.every((val, i) => val === sortedB[i]);
		};

		// Check if different from original channel data
		const differentFromOriginal =
			current.channel_name !== originalData.channel_name ||
			current.username !== originalData.username ||
			current.bias !== originalData.bias ||
			current.invite !== originalData.invite ||
			current.avatar !== originalData.avatar ||
			!arraysEqual(current.bloats, originalData.bloats);

		// If there's pending data, also check if different from pending
		if (pendingData) {
			const differentFromPending =
				current.channel_name !== pendingData.channel_name ||
				current.username !== pendingData.username ||
				current.bias !== pendingData.bias ||
				current.invite !== pendingData.invite ||
				current.avatar !== pendingData.avatar ||
				!arraysEqual(current.bloats, pendingData.bloats);

			return differentFromPending;
		}

		return differentFromOriginal;
	});
</script>

<svelte:head>
	<title>Edit Channel - {data.channel.channel_name}</title>
	<meta name="description" content="Edit channel information" />
</svelte:head>

<!-- Header -->
<header class="mb-8">
	<a
		href="/channel/{data.channel.channel_id}"
		class="group mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="size-5" />
		<span class="text-sm font-medium">Back to Channel</span>
	</a>

	<h1 class="mb-2 text-3xl font-bold text-white">Edit Channel</h1>
	<p class="text-white/60">
		{data.isAdmin
			? 'Update channel information directly'
			: 'Submit changes for admin review and approval'}
	</p>
</header>

<!-- Loading Overlay -->
{#if $submitting}
	<div class="alert mb-6 border-blue-500/20 bg-blue-500/10 animate-pulse">
		<span class="loading loading-spinner loading-md text-blue-400"></span>
		<div>
			<h3 class="font-semibold text-blue-400">Processing...</h3>
			<div class="text-sm text-blue-300/80">
				{data.isAdmin ? 'Saving changes...' : 'Submitting for review...'}
			</div>
		</div>
	</div>
{/if}

<!-- Info Box -->
{#if !data.isAdmin}
	<div class="alert mb-6 border-blue-500/20 bg-blue-500/10">
		<FluentInfo24Regular class="size-6 text-blue-400" />
		<div class="text-sm text-blue-300/80">
			{#if data.pendingEdit}
				<strong class="text-blue-400">You have pending changes:</strong> Editing this form will update
				your pending changes awaiting admin approval.
			{:else}
				<strong class="text-blue-400">Note:</strong> Your changes will be submitted for admin review
				before being applied to the channel.
			{/if}
		</div>
	</div>
{/if}

<!-- Form -->
<div class="rounded-lg border border-white/20 bg-white/5 p-6">
	<form method="POST" use:enhance class="space-y-6">
		<!-- Channel Name -->
		<div>
			<label for="channel-name" class="mb-2 block text-sm font-medium text-white">
				Channel Name <span class="text-red-400">*</span>
			</label>
			<input
				id="channel-name"
				type="text"
				name="channel_name"
				placeholder="e.g., BBC News"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.channel_name}
				bind:value={$form.channel_name}
				disabled={$submitting}
			/>
			{#if $errors.channel_name}
				<p class="mt-1 text-xs text-red-400">{$errors.channel_name}</p>
			{/if}
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
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.username}
				bind:value={$form.username}
				disabled={$submitting}
			/>
			{#if $errors.username}
				<p class="mt-1 text-xs text-red-400">{$errors.username}</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">Enter the username without the @ symbol</p>
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
				<option value="" class="bg-gray-900 text-white">Select a region</option>
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

		<!-- Invite Link (Optional) -->
		<div>
			<label for="invite" class="mb-2 block text-sm font-medium text-white"> Invite Link </label>
			<input
				id="invite"
				type="text"
				name="invite"
				placeholder="e.g., https://t.me/+AbCdEfGhIjK or just the hash"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.invite}
				bind:value={$form.invite}
				disabled={$submitting}
			/>
			{#if $errors.invite}
				<p class="mt-1 text-xs text-red-400">{$errors.invite}</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">
					Only needed for private channels. Paste the full invite link or just the hash.
				</p>
			{/if}
		</div>

		<!-- Avatar URL (Optional) -->
		<div>
			<label for="avatar" class="mb-2 block text-sm font-medium text-white"> Avatar URL </label>
			<input
				id="avatar"
				type="url"
				name="avatar"
				placeholder="https://example.com/avatar.jpg"
				class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				class:border-red-500={$errors.avatar}
				bind:value={$form.avatar}
				disabled={$submitting}
			/>
			{#if $errors.avatar}
				<p class="mt-1 text-xs text-red-400">{$errors.avatar}</p>
			{:else}
				<p class="mt-1 text-xs text-white/50">
					Optional: Direct link to the channel's avatar image
				</p>
			{/if}
			{#if $form.avatar}
				<div class="mt-3">
					<p class="mb-2 text-xs font-medium text-white/80">Preview:</p>
					<div class="avatar">
						<div class="w-16 rounded-full ring ring-white/20 ring-offset-2 ring-offset-gray-900">
							<img src={$form.avatar} alt="Avatar preview" />
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Bloats Section -->
		<div class="border-t border-white/10 pt-6">
			<label class="mb-3 block text-sm font-medium text-white">
				Bloat Patterns
				<span class="ml-2 text-xs font-normal text-white/60">(Regex patterns to filter ads/footers)</span>
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
				Add regex patterns to automatically remove advertisements or repetitive footers from messages.
			</p>

			<!-- Hidden input for form submission -->
			{#each $form.bloats as pattern, i}
				<input type="hidden" name="bloats" value={pattern} />
			{/each}

			<!-- List of patterns -->
			{#if $form.bloats.length > 0}
				<div class="space-y-2">
					{#each $form.bloats as pattern, index}
						<div class="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
							<code class="flex-1 break-all text-sm text-green-400">{pattern}</code>
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
				<div class="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-center text-sm text-white/50">
					No bloat patterns added yet. Add patterns above to filter unwanted content.
				</div>
			{/if}
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end border-t border-white/10 pt-6">
			<button
				type="submit"
				class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={$submitting || !hasChanges()}
			>
				{#if $submitting}
					<span class="loading loading-spinner loading-sm"></span>
					<span>Saving...</span>
				{:else}
					<FluentCheckmark24Regular class="size-5" />
					<span>{data.isAdmin ? 'Save Changes' : 'Submit for Review'}</span>
				{/if}
			</button>
		</div>
	</form>
</div>
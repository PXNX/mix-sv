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
	let uploadError = $state('');
	let avatarFile = $state<File | null>(null);

	// Check if channel is private (no username)
	const isPrivateChannel = $derived(!$form.username || $form.username.trim() === '');

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

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			avatarFile = file;
			uploadError = '';
		}
	}

	function clearAvatarFile() {
		avatarFile = null;
		const fileInput = document.getElementById('avatar-file') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
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
	<form method="POST" use:enhance class="space-y-6" enctype="multipart/form-data">
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

		<!-- Avatar Upload (Only for Private Channels) -->
		{#if isPrivateChannel}
			<div>
				<label class="mb-2 block text-sm font-medium text-white">
					Channel Avatar <span class="text-xs text-white/50">(Optional - Private channels only)</span>
				</label>
				
				{#if $form.avatar && !avatarFile}
					<div class="mb-4 flex items-center gap-4 rounded-lg border border-white/20 bg-white/5 p-4">
						<div class="h-16 w-16 overflow-hidden rounded-lg">
							<img 
								src={$form.avatar.startsWith('http') ? $form.avatar : `https://your-bucket-url.backblazeb2.com/${$form.avatar}`}
								alt="Current avatar"
								class="h-full w-full object-cover"
							/>
						</div>
						<div class="flex-1">
							<p class="text-sm text-white">Current avatar</p>
							<button
								type="button"
								class="mt-1 text-xs text-red-400 hover:text-red-300"
								onclick={() => ($form.avatar = '')}
								disabled={$submitting}
							>
								Remove avatar
							</button>
						</div>
					</div>
				{/if}

				{#if avatarFile}
					<div class="mb-4 flex items-center gap-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
						<div class="h-16 w-16 overflow-hidden rounded-lg">
							<img 
								src={URL.createObjectURL(avatarFile)}
								alt="New avatar preview"
								class="h-full w-full object-cover"
							/>
						</div>
						<div class="flex-1">
							<p class="text-sm text-white">{avatarFile.name}</p>
							<p class="text-xs text-white/60">{Math.round(avatarFile.size / 1024)} KB</p>
						</div>
						<button
							type="button"
							class="text-white/40 transition-colors hover:text-red-400"
							onclick={clearAvatarFile}
							disabled={$submitting}
						>
							<FluentDelete24Regular class="size-5" />
						</button>
					</div>
				{/if}

				<div class="relative">
					<input
						id="avatar-file"
						type="file"
						name="avatarFile"
						accept="image/*"
						class="hidden"
						onchange={handleFileSelect}
						disabled={$submitting}
					/>
					<button
						type="button"
						onclick={() => document.getElementById('avatar-file')?.click()}
						disabled={$submitting}
						class="w-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-8 text-center transition-colors hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<div class="flex flex-col items-center gap-2">
							<div class="rounded-full bg-white/10 p-3">
								<svg class="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-white">
									{avatarFile ? 'Change avatar' : 'Click to upload avatar'}
								</p>
								<p class="mt-1 text-xs text-white/60">
									PNG, JPG up to 5MB • Will be resized to 96x96px
								</p>
							</div>
						</div>
					</button>
				</div>

				{#if uploadError}
					<p class="mt-2 text-xs text-red-400">{uploadError}</p>
				{:else}
					<p class="mt-2 text-xs text-white/50">
						Avatar uploads are only available for private channels. Image will be uploaded when you submit the form.
					</p>
				{/if}

				<!-- Hidden input for existing avatar key -->
				<input type="hidden" name="avatar" bind:value={$form.avatar} />
			</div>
		{:else}
			<div class="rounded-lg border border-white/10 bg-white/5 p-4">
				<p class="text-sm text-white/60">
					💡 Avatar uploads are only available for private channels (channels without a username).
				</p>
			</div>
		{/if}

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

		<!-- Username -->
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
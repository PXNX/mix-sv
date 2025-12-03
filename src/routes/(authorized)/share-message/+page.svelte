<!-- src/routes/share-message/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import IconTelegram from '~icons/fluent/channel-24-regular';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let status = $state('Processing shared message...');
	let error = $state('');

	onMount(() => {
		processSharedContent();
	});

	function processSharedContent() {
		const url = page.url.searchParams.get('url');
		const title = page.url.searchParams.get('title');
		const text = page.url.searchParams.get('text');

		console.log('Shared content:', { url, title, text });

		// Try to extract Telegram channel info from URL
		if (url) {
			const channelInfo = extractTelegramChannel(url);
			if (channelInfo) {
				navigateToNewChannel(channelInfo);
				return;
			}
		}

		// Try to extract from text if URL parsing failed
		if (text) {
			const channelInfo = extractTelegramChannel(text);
			if (channelInfo) {
				navigateToNewChannel(channelInfo);
				return;
			}
		}

		// No valid channel found
		error = 'Could not extract Telegram channel from shared content';
		setTimeout(() => goto('/'), 3000);
	}

	function extractTelegramChannel(input: string): {
		channelId?: string;
		username?: string;
		channelName?: string;
	} | null {
		try {
			// Pattern 1: Private channel message link - https://t.me/c/1234567890/123
			const privatePattern = /t\.me\/c\/(\d+)/;
			const privateMatch = input.match(privatePattern);
			if (privateMatch) {
				return {
					channelId: `-100${privateMatch[1]}`
				};
			}

			// Pattern 2: Public channel - https://t.me/channelname or https://t.me/channelname/123
			const publicPattern = /t\.me\/([a-zA-Z0-9_]+)/;
			const publicMatch = input.match(publicPattern);
			if (publicMatch && publicMatch[1] !== 'c') {
				const username = publicMatch[1];
				return {
					username: username,
					channelName: username // Will be cleaned up by user
				};
			}

			// Pattern 3: Invite link - https://t.me/+AbCdEfGhIjK or https://t.me/joinchat/AbCdEfGhIjK
			const invitePattern = /t\.me\/(?:\+|joinchat\/)([A-Za-z0-9_-]+)/;
			const inviteMatch = input.match(invitePattern);
			if (inviteMatch) {
				return {
					channelName: 'Private Channel' // User will need to fill in details
				};
			}

			return null;
		} catch (err) {
			console.error('Error parsing Telegram channel:', err);
			return null;
		}
	}

	function navigateToNewChannel(channelInfo: {
		channelId?: string;
		username?: string;
		channelName?: string;
	}) {
		const params = new SvelteURLSearchParams();

		if (channelInfo.channelId) {
			params.set('channelId', channelInfo.channelId);
		}
		if (channelInfo.username) {
			params.set('username', channelInfo.username);
		}
		if (channelInfo.channelName) {
			params.set('channelName', channelInfo.channelName);
		}

		goto(`/channel/new?${params.toString()}`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-black">
	<div class="w-96 rounded-lg border border-white/20 bg-white/5 p-8 shadow-xl">
		<div class="flex flex-col items-center text-center">
			{#if error}
				<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
					<span>{error}</span>
				</div>
				<p class="text-sm text-white/60">Redirecting to home...</p>
			{:else}
				<IconTelegram class="mb-4 size-16 animate-pulse text-blue-400" />
				<h2 class="mb-2 text-xl font-bold text-white">{status}</h2>
				<div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
					<div class="h-full w-full animate-pulse bg-blue-400"></div>
				</div>
			{/if}
		</div>
	</div>
</div>

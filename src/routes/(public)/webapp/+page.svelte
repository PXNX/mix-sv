<!-- src/routes/(public)/webapp/+page.svelte -->
<!-- Bootstrap page for links opened as a Telegram Mini App (WebAppInfo button
     in ptb-nn). Authenticates via window.Telegram.WebApp.initData, then
     redirects to ?next=... (e.g. /channel/123/edit). The SDK itself is already
     loaded site-wide in app.html and readied by the root +layout.svelte
     (src/lib/utils/telegram.ts) - this page only needs to read initData. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let status = $state<'loading' | 'error'>('loading');
	let errorMessage = $state('');

	onMount(async () => {
		const next = page.url.searchParams.get('next') || '/';
		const initData = window.Telegram?.WebApp?.initData;

		if (!initData) {
			status = 'error';
			errorMessage = 'This page must be opened from within Telegram.';
			return;
		}

		try {
			const response = await fetch('/auth/webapp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ initData })
			});

			if (!response.ok) {
				status = 'error';
				errorMessage = 'Could not verify your Telegram account. Please try again.';
				return;
			}

			await goto(next, { replaceState: true, invalidateAll: true });
		} catch (err) {
			console.error('WebApp bootstrap failed:', err);
			status = 'error';
			errorMessage = 'Something went wrong connecting to Telegram.';
		}
	});
</script>

<svelte:head>
	<title>Opening…</title>
</svelte:head>

<div class="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
	{#if status === 'loading'}
		<span class="loading loading-spinner loading-lg text-white"></span>
		<p class="text-white/70">Connecting your Telegram account…</p>
	{:else}
		<p class="text-red-400">{errorMessage}</p>
	{/if}
</div>

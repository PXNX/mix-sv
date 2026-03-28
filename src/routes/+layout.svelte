<script lang="ts">
	import { onMount } from 'svelte';
	import CookieBanner from '$lib/component/CookieBanner.svelte';
	import '../app.css';
	import { readyTelegramWebApp, expandTelegramWebApp } from '$lib/utils/telegram';

	let { children } = $props();

	onMount(() => {
		// Initialize Telegram Web App
		readyTelegramWebApp();
		expandTelegramWebApp();
	});
</script>

<div
	class="flex min-h-dvh w-dvw items-center justify-center p-4"
	style="font-family:'HP Simplified'"
>
	<div class="flex w-full flex-col sm:w-3xl">
		{@render children()}
	</div>
</div>

<CookieBanner />

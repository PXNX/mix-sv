<script lang="ts">
	import CookieBanner from '$lib/component/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<div
	class="100dvw 100dvh flex flex-row items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-teal-400 p-2"
	style="font-family:'HP Simplified'"
>
	{@render children()}
</div>

<CookieBanner />

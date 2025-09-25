<script lang="ts">
	import CookieBanner from '$lib/component/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<div
	class="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-teal-400 p-4"
	style="font-family:'HP Simplified'"
>
	<div class="flex w-full flex-col sm:w-3xl">
		{@render children()}
	</div>
</div>

<CookieBanner />

<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import SimpleIconsTelegram from '~icons/simple-icons/telegram';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { channel } = data;

	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>{channel.channel_name} - Channel Details</title>
	<meta name="description" content="Details for {channel.channel_name} Telegram channel" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Back Button -->
<div class="mb-8">
	<button
		onclick={goBack}
		class="group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20"
	>
		<FluentArrowLeft24Regular
			class="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
		/>
		<span class="font-semibold">Back to Search</span>
	</button>
</div>

<!-- Channel Header Card -->
<div
	class="card mb-8 overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md"
	style="view-transition-name: channel-{channel.channel_id}"
>
	<div class="card-body p-8">
		<div class="flex flex-col items-center gap-6 text-center">
			<!-- Avatar -->
			<div class="shrink-0" style="view-transition-name: avatar-{channel.channel_id}">
				<div class="avatar">
					<div
						class="h-32 w-32 rounded-3xl ring-4 ring-white/40 ring-offset-4 ring-offset-transparent"
					>
						<img src={channel.avatar} alt="Channel Avatar" class="object-cover" />
					</div>
				</div>
			</div>

			<!-- Channel Info -->
			<div class="space-y-4">
				<h1
					class="bg-linear-to-r from-white via-pink-100 to-blue-100 bg-clip-text text-4xl font-bold text-white"
				>
					{channel.channel_name}
				</h1>
				{#if channel.username}
					<p class="flex items-center justify-center gap-2 text-lg text-white/80">
						@{channel.username}
					</p>
				{/if}

				{#if channel.bias}
					<div
						class="inline-block rounded-2xl border border-white/40 bg-white/20 px-6 py-3 text-3xl tracking-wide backdrop-blur-sm"
					>
						{channel.bias}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Gradient overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-linear-to-r from-pink-500/10 to-blue-500/10 opacity-50"
	></div>
</div>

<!-- Action Buttons -->
<div class="space-y-4">
	{#if channel.username}
		<a
			href={`https://t.me/${channel.username}`}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-lg w-full border-none bg-linear-to-r from-pink-500 to-purple-600 text-white transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700"
		>
			<SimpleIconsTelegram class="size-6" />
			Open in Telegram
		</a>
	{:else if channel.invite}
		<a
			href={`https://t.me/+${channel.invite}`}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-lg w-full border-none bg-linear-to-r from-blue-500 to-teal-600 text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-teal-700"
		>
			<SimpleIconsTelegram class="size-6" />
			Join Channel
		</a>
	{:else}
		<div class="btn btn-lg btn-disabled w-full border-white/20 bg-white/10 text-white/50">
			<SimpleIconsTelegram class="size-6" />
			Channel Not Available
		</div>
	{/if}
</div>

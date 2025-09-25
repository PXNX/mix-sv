<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { channel } = data;

	function goBackToSearch() {
		goto('/');
	}
</script>

<svelte:head>
	<title>{channel.name} - Channel Details</title>
	<meta name="description" content="Details for {channel.name} Telegram channel" />
</svelte:head>

<div class="bg-base-100 min-h-screen p-6">
	<div class="mx-auto max-w-2xl space-y-8">
		<!-- Back Button -->
		<button class="btn btn-ghost hover:btn-neutral transition-colors" onclick={goBackToSearch}>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path>
			</svg>
			Back
		</button>

		<!-- Main Card -->
		<div class="bg-base-200/50 space-y-8 rounded-3xl p-8">
			<!-- Header -->
			<div class="flex items-center gap-6">
				<div class="avatar">
					<div class="w-20 rounded-2xl">
						<img src={channel.avatar} alt={channel.name} />
					</div>
				</div>
				<div class="flex-1">
					<h1 class="text-base-content text-2xl font-bold">{channel.name}</h1>
					<p class="text-base-content/60">@{channel.username}</p>
				</div>
			</div>

			<!-- Details -->
			<div class="grid gap-4">
				<div class="border-base-300/30 flex items-center justify-between border-b py-3">
					<span class="text-base-content/70">Channel ID</span>
					<code class="bg-base-300/50 rounded px-2 py-1 text-sm">{channel.id}</code>
				</div>

				<div class="border-base-300/30 flex items-center justify-between border-b py-3">
					<span class="text-base-content/70">Username</span>
					<span class="font-medium">@{channel.username}</span>
				</div>

				<div class="flex items-center justify-between py-3">
					<span class="text-base-content/70">Region</span>
					<span class="text-2xl">{channel.bias}</span>
				</div>
			</div>

			<!-- Join Button - Only show if no username available -->
			{#if !channel.username && channel.inviteLink}
				<a href={channel.inviteLink} target="_blank" class="btn btn-primary w-full rounded-2xl">
					Join Channel
				</a>
			{:else if !channel.username}
				<div class="btn btn-disabled w-full rounded-2xl">Invite Not Available</div>
			{/if}
		</div>
	</div>
</div>

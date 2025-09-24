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

<div class="space-y-6">
	<button class="btn btn-ghost" onclick={goBackToSearch}>
		<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
			></path>
		</svg>
		Back to Search
	</button>

	<div
		class="card bg-base-100 channel-card shadow-xl"
		style="view-transition-name: channel-{channel.id}"
	>
		<div class="card-body">
			<div class="mb-6 flex items-center space-x-6">
				<div class="avatar channel-avatar" style="view-transition-name: avatar-{channel.id}">
					<div class="w-24 rounded-full">
						<img src={channel.avatar} alt={channel.name} />
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-3xl font-bold">{channel.name}</h2>
					<p class="text-base-content/70 text-xl">{channel.username}</p>
					<div class="mt-2 text-3xl">{channel.bias}</div>
				</div>
			</div>

			<div class="divider"></div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="space-y-4">
					<div>
						<h3 class="mb-2 text-lg font-semibold">Channel ID</h3>
						<div class="bg-base-200 rounded-lg p-3 font-mono">
							{channel.id}
						</div>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-semibold">Username</h3>
						<div class="bg-base-200 rounded-lg p-3">
							{channel.username}
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<h3 class="mb-2 text-lg font-semibold">Bias/Region</h3>
						<div class="bg-base-200 rounded-lg p-3 text-center">
							<span class="text-2xl">{channel.bias}</span>
						</div>
					</div>

					{#if channel.inviteLink}
						<div>
							<h3 class="mb-2 text-lg font-semibold">Invite Link</h3>
							<a href={channel.inviteLink} target="_blank" class="btn btn-primary w-full">
								Join Channel
								<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									></path>
								</svg>
							</a>
						</div>
					{:else}
						<div>
							<h3 class="mb-2 text-lg font-semibold">Invite Link</h3>
							<div class="bg-base-200 text-base-content/50 rounded-lg p-3 text-center">
								Not Available
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

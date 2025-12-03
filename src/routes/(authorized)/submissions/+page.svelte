<!-- src/routes/submissions/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentCheckmark24Regular from '~icons/fluent/checkmark-24-regular';
	import FluentDismiss24Regular from '~icons/fluent/dismiss-24-regular';
	import FluentClock24Regular from '~icons/fluent/clock-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
	import ChannelAvatar from '$lib/components/ChannelAvatar.svelte';
	import type { PageData, ActionData } from './$types';
	import { getSignedDownloadUrl } from '$lib/server/backblaze';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let deletingId = $state<number | null>(null);
	let deletingType = $state<'creation' | 'edit' | null>(null);

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'badge-warning';
			case 'approved':
				return 'badge-success';
			case 'rejected':
				return 'badge-error';
			default:
				return 'badge-ghost';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending':
				return FluentClock24Regular;
			case 'approved':
				return FluentCheckmark24Regular;
			case 'rejected':
				return FluentDismiss24Regular;
			default:
				return FluentClock24Regular;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function parseBloats(bloatsJson: string | null): string[] {
		if (!bloatsJson) return [];
		try {
			return JSON.parse(bloatsJson);
		} catch {
			return [];
		}
	}

	async function getAvatarUrl(fileId: string | null): Promise<string | null> {
		if (!fileId) return null;
		try {
			return await getSignedDownloadUrl(fileId);
		} catch {
			return null;
		}
	}
</script>

<svelte:head>
	<title>My Submissions - Telegram Channel Search</title>
	<meta name="description" content="View and manage your channel submissions" />
</svelte:head>

<!-- Header -->
<header class="mb-8">
	<a
		href="/"
		class="group mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="size-5" />
		<span class="text-sm font-medium">Back to Search</span>
	</a>

	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-2 text-3xl font-bold text-white">My Submissions</h1>
			<p class="text-white/60">View and manage your pending channel submissions</p>
		</div>
		<a
			href="/channel/new"
			class="btn btn-primary flex items-center gap-2 border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
		>
			<FluentAdd24Regular class="size-5" />
			<span>New Channel</span>
		</a>
	</div>
</header>

<!-- Success/Error Messages -->
{#if form?.success}
	<div class="alert alert-success mb-6 border-green-500/20 bg-green-500/10">
		<FluentCheckmark24Regular class="size-6 text-green-400" />
		<div>
			<h3 class="font-semibold text-green-400">Success!</h3>
			<div class="text-sm text-green-300/80">{form.message}</div>
		</div>
	</div>
{/if}

{#if form?.error}
	<div class="alert alert-error mb-6 border-red-500/20 bg-red-500/10">
		<FluentDismiss24Regular class="size-6 text-red-400" />
		<div>
			<h3 class="font-semibold text-red-400">Error</h3>
			<div class="text-sm text-red-300/80">{form.error}</div>
		</div>
	</div>
{/if}

<!-- Pending Creations -->
<section class="mb-8">
	<div class="mb-4 flex items-center gap-2">
		<FluentAdd24Regular class="size-6 text-white" />
		<h2 class="text-2xl font-bold text-white">New Channel Submissions</h2>
		<span class="badge badge-sm badge-ghost">{data.pendingCreations.length}</span>
	</div>

	{#if data.pendingCreations.length === 0}
		<div class="rounded-lg border border-white/20 bg-white/5 p-8 text-center">
			<p class="text-white/60">You haven't submitted any new channels yet.</p>
			<a
				href="/channel/new"
				class="btn btn-primary mt-4 border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
			>
				<FluentAdd24Regular class="size-5" />
				Submit Your First Channel
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.pendingCreations as { creation, avatarFile }}
				{@const bloatPatterns = parseBloats(creation.bloats)}
				<div class="rounded-lg border border-white/20 bg-white/5 p-6 transition-colors hover:bg-white/10">
					<div class="flex items-start gap-4">
						{#if creation.avatar && avatarFile}
							{#await getAvatarUrl(avatarFile.id) then avatarUrl}
								<ChannelAvatar
									username={creation.username}
									alt={creation.channelName}
									avatarUrl={avatarUrl}
									size="lg"
								/>
							{/await}
						{:else}
							<ChannelAvatar
								username={creation.username}
								alt={creation.channelName}
								size="lg"
							/>
						{/if}

						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<h3 class="text-xl font-semibold text-white">{creation.channelName}</h3>
								<span class="badge {getStatusColor(creation.status)} badge-sm gap-1">
									<svelte:component this={getStatusIcon(creation.status)} class="size-4" />
									{creation.status}
								</span>
								<span class="text-2xl">{creation.bias}</span>
							</div>

							<div class="mb-3 space-y-1 text-sm text-white/60">
								{#if creation.channelId}
									<p>
										<span class="font-medium text-white/80">Channel ID:</span>
										<code class="rounded bg-white/5 px-1 font-mono text-xs">{creation.channelId}</code>
									</p>
								{/if}
								<p>
									<span class="font-medium text-white/80">Username:</span>
									@{creation.username}
								</p>
								{#if creation.invite}
									<p>
										<span class="font-medium text-white/80">Invite:</span>
										{creation.invite}
									</p>
								{/if}
								{#if bloatPatterns.length > 0}
									<div class="mt-2">
										<span class="font-medium text-white/80">Bloat Patterns ({bloatPatterns.length}):</span>
										<div class="mt-1 space-y-1">
											{#each bloatPatterns as pattern}
												<code class="block rounded bg-white/5 px-2 py-1 text-xs text-green-400">
													{pattern}
												</code>
											{/each}
										</div>
									</div>
								{/if}
							</div>

							<div class="text-xs text-white/50">
								Submitted {formatDate(creation.createdAt)}
								{#if creation.reviewedAt}
									• Reviewed {formatDate(creation.reviewedAt)}
								{/if}
							</div>
						</div>

						{#if creation.status === 'pending'}
							<form
								method="POST"
								action="?/deleteCreation"
								use:enhance={() => {
									deletingId = creation.id;
									deletingType = 'creation';
									return async ({ update }) => {
										await update();
										deletingId = null;
										deletingType = null;
									};
								}}
							>
								<input type="hidden" name="id" value={creation.id} />
								<button
									type="submit"
									class="btn btn-error btn-sm gap-2 border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20"
									disabled={deletingId === creation.id && deletingType === 'creation'}
								>
									{#if deletingId === creation.id && deletingType === 'creation'}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<FluentDelete24Regular class="size-4" />
									{/if}
									Delete
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Pending Edits -->
<section>
	<div class="mb-4 flex items-center gap-2">
		<FluentEdit24Regular class="size-6 text-white" />
		<h2 class="text-2xl font-bold text-white">Channel Edit Submissions</h2>
		<span class="badge badge-sm badge-ghost">{data.pendingEdits.length}</span>
	</div>

	{#if data.pendingEdits.length === 0}
		<div class="rounded-lg border border-white/20 bg-white/5 p-8 text-center">
			<p class="text-white/60">You haven't submitted any channel edits yet.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.pendingEdits as { edit, avatarFile }}
				{@const bloatPatterns = parseBloats(edit.bloats)}
				<div class="rounded-lg border border-white/20 bg-white/5 p-6 transition-colors hover:bg-white/10">
					<div class="flex items-start gap-4">
						{#if edit.avatar && avatarFile}
							{#await getAvatarUrl(avatarFile.id) then avatarUrl}
								<ChannelAvatar
									username={edit.username}
									alt={edit.channelName || 'Channel'}
									avatarUrl={avatarUrl}
									size="lg"
								/>
							{/await}
						{:else if edit.username}
							<ChannelAvatar
								username={edit.username}
								alt={edit.channelName || 'Channel'}
								size="lg"
							/>
						{/if}

						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<h3 class="text-xl font-semibold text-white">
									{edit.channelName || 'Channel Edit'}
								</h3>
								<span class="badge {getStatusColor(edit.status)} badge-sm gap-1">
									<svelte:component this={getStatusIcon(edit.status)} class="size-4" />
									{edit.status}
								</span>
								{#if edit.bias}
									<span class="text-2xl">{edit.bias}</span>
								{/if}
							</div>

							<div class="mb-3 space-y-1 text-sm text-white/60">
								{#if edit.username}
									<p>
										<span class="font-medium text-white/80">Username:</span>
										@{edit.username}
									</p>
								{/if}
								{#if edit.invite}
									<p>
										<span class="font-medium text-white/80">Invite:</span>
										{edit.invite}
									</p>
								{/if}
								{#if edit.channelId}
									<p>
										<span class="font-medium text-white/80">Editing Channel ID:</span>
										<code class="rounded bg-white/5 px-1 font-mono text-xs">{edit.channelId}</code>
									</p>
								{/if}
								{#if bloatPatterns.length > 0}
									<div class="mt-2">
										<span class="font-medium text-white/80">Bloat Patterns ({bloatPatterns.length}):</span>
										<div class="mt-1 space-y-1">
											{#each bloatPatterns as pattern}
												<code class="block rounded bg-white/5 px-2 py-1 text-xs text-green-400">
													{pattern}
												</code>
											{/each}
										</div>
									</div>
								{/if}
							</div>

							<div class="text-xs text-white/50">
								Submitted {formatDate(edit.createdAt)}
								{#if edit.reviewedAt}
									• Reviewed {formatDate(edit.reviewedAt)}
								{/if}
							</div>
						</div>

						{#if edit.status === 'pending'}
							<form
								method="POST"
								action="?/deleteEdit"
								use:enhance={() => {
									deletingId = edit.id;
									deletingType = 'edit';
									return async ({ update }) => {
										await update();
										deletingId = null;
										deletingType = null;
									};
								}}
							>
								<input type="hidden" name="id" value={edit.id} />
								<button
									type="submit"
									class="btn btn-error btn-sm gap-2 border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20"
									disabled={deletingId === edit.id && deletingType === 'edit'}
								>
									{#if deletingId === edit.id && deletingType === 'edit'}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<FluentDelete24Regular class="size-4" />
									{/if}
									Delete
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
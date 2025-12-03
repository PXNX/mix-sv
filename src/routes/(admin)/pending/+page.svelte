<!-- src/routes/(authorized)/pending/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentEmojiCheckMark from '~icons/fluent-emoji/check-mark';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';
	import ChannelAvatar from '$lib/components/ChannelAvatar.svelte';
	import { getSignedDownloadUrl } from '$lib/server/backblaze';

	let { data } = $props();

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE');
	}

	function formatValue(value: any): string {
		if (value === null || value === undefined) return 'Not set';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		return value.toString();
	}

	interface DiffField {
		label: string;
		oldValue: any;
		newValue: any;
		hasChanged: boolean;
		type?: 'text' | 'array' | 'avatar';
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

	function getChanges(edit: any, source: any, editAvatarFile: any): DiffField[] {
		const fields: DiffField[] = [
			{
				label: 'Channel Name',
				oldValue: source.channelName,
				newValue: edit.channelName,
				hasChanged: edit.channelName !== null && edit.channelName !== source.channelName,
				type: 'text'
			},
			{
				label: 'Username',
				oldValue: source.username,
				newValue: edit.username,
				hasChanged: edit.username !== null && edit.username !== source.username,
				type: 'text'
			},
			{
				label: 'Bias',
				oldValue: source.bias,
				newValue: edit.bias,
				hasChanged: edit.bias !== null && edit.bias !== source.bias,
				type: 'text'
			},
			{
				label: 'Invite Link',
				oldValue: source.invite,
				newValue: edit.invite,
				hasChanged: edit.invite !== null && edit.invite !== source.invite,
				type: 'text'
			}
		];

		// Add avatar comparison if present in edit
		if (edit.avatar !== null) {
			fields.push({
				label: 'Avatar',
				oldValue: source.avatar,
				newValue: editAvatarFile,
				hasChanged: edit.avatar !== source.avatar,
				type: 'avatar'
			});
		}

		// Add bloats comparison if present in edit
		if (edit.bloats !== null) {
			const newBloats = parseBloats(edit.bloats);
			const oldBloats: string[] = []; // We'd need to fetch existing bloats, for now show as new
			
			fields.push({
				label: 'Bloat Patterns',
				oldValue: oldBloats,
				newValue: newBloats,
				hasChanged: true,
				type: 'array'
			});
		}

		return fields.filter((f) => f.hasChanged);
	}
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-white">
		{data.isAdmin ? 'Pending Edits' : 'My Pending Edits'}
	</h1>

	{#if data.pendingEdits.length === 0}
		<p class="text-white/70">
			{data.isAdmin ? 'No pending edits to review.' : 'You have no pending edits awaiting review.'}
		</p>
	{:else}
		<div class="space-y-6">
			{#each data.pendingEdits as { edit, source, user, editAvatarFile }}
				{@const changes = getChanges(edit, source, editAvatarFile)}
				<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h3 class="text-xl font-semibold text-white">{source.channelName}</h3>
							<p class="text-sm text-white/60">
								{#if data.isAdmin}
									Submitted by {user.email} on {formatDate(edit.createdAt)}
								{:else}
									Submitted on {formatDate(edit.createdAt)}
								{/if}
							</p>
							{#if !data.isAdmin}
								<p class="mt-1 text-sm font-medium text-yellow-400">⏳ Awaiting admin review</p>
							{/if}
							<p class="text-sm font-medium text-blue-400">
								{changes.length}
								{changes.length === 1 ? 'change' : 'changes'} proposed
							</p>
						</div>
						<a href="/channel/{source.channelId}" class="text-blue-400 hover:text-blue-300">
							View Channel
						</a>
					</div>

					<div class="mb-6 space-y-3">
						{#each changes as change}
							<div class="rounded-lg border border-white/10 bg-black/20 p-4">
								<h4 class="mb-3 font-semibold text-white">{change.label}</h4>
								
								{#if change.type === 'avatar'}
									<div class="space-y-2">
										<div class="flex items-center gap-3 rounded border-l-4 border-red-500 bg-red-950/40 px-3 py-2">
											<span class="font-mono text-xs text-red-400">−</span>
											{#if change.oldValue}
												{#await getAvatarUrl(change.oldValue) then avatarUrl}
													<ChannelAvatar
														username={source.username}
														alt={source.channelName}
														avatarUrl={avatarUrl}
														size="md"
													/>
												{/await}
											{:else}
												<span class="text-sm text-red-200">No avatar</span>
											{/if}
										</div>
										<div class="flex items-center gap-3 rounded border-l-4 border-green-500 bg-green-950/40 px-3 py-2">
											<span class="font-mono text-xs text-green-400">+</span>
											{#if change.newValue}
												{#await getAvatarUrl(change.newValue.id) then avatarUrl}
													<ChannelAvatar
														username={edit.username || source.username}
														alt={edit.channelName || source.channelName}
														avatarUrl={avatarUrl}
														size="md"
													/>
												{/await}
											{:else}
												<span class="text-sm text-green-200">No avatar</span>
											{/if}
										</div>
									</div>
								{:else if change.type === 'array'}
									<div class="space-y-2">
										{#if Array.isArray(change.oldValue) && change.oldValue.length > 0}
											<div class="rounded border-l-4 border-red-500 bg-red-950/40 px-3 py-2">
												<span class="mb-2 block font-mono text-xs text-red-400">− Removed:</span>
												<div class="space-y-1">
													{#each change.oldValue as pattern}
														<code class="block text-sm text-red-200">{pattern}</code>
													{/each}
												</div>
											</div>
										{/if}
										{#if Array.isArray(change.newValue) && change.newValue.length > 0}
											<div class="rounded border-l-4 border-green-500 bg-green-950/40 px-3 py-2">
												<span class="mb-2 block font-mono text-xs text-green-400">+ Added:</span>
												<div class="space-y-1">
													{#each change.newValue as pattern}
														<code class="block text-sm text-green-200">{pattern}</code>
													{/each}
												</div>
											</div>
										{:else if Array.isArray(change.newValue) && change.newValue.length === 0}
											<div class="rounded border-l-4 border-yellow-500 bg-yellow-950/40 px-3 py-2">
												<span class="text-sm text-yellow-200">All patterns removed</span>
											</div>
										{/if}
									</div>
								{:else}
									<div class="space-y-2">
										<div class="flex items-start gap-3 rounded border-l-4 border-red-500 bg-red-950/40 px-3 py-2">
											<span class="font-mono text-xs text-red-400">−</span>
											<span class="flex-1 text-sm text-red-200">{formatValue(change.oldValue)}</span>
										</div>
										<div class="flex items-start gap-3 rounded border-l-4 border-green-500 bg-green-950/40 px-3 py-2">
											<span class="font-mono text-xs text-green-400">+</span>
											<span class="flex-1 text-sm text-green-200">{formatValue(change.newValue)}</span>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<div class="flex flex-row-reverse justify-between gap-2">
						{#if data.isAdmin}
							<form method="POST" action="?/reject" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<button type="submit" class="btn btn-error flex items-center gap-2">
									<FluentEmojiCrossMark class="size-5" />
									Reject
								</button>
							</form>

							<form method="POST" action="?/approve" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<button type="submit" class="btn btn-success flex items-center gap-2">
									<FluentEmojiCheckMark class="size-5" />
									Approve
								</button>
							</form>
						{:else}
							<form method="POST" action="?/remove" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<button type="submit" class="btn btn-error flex items-center gap-2">
									<FluentEmojiCrossMark class="size-5" />
									Cancel Pending Edit
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
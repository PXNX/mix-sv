<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentEmojiCheckMark from '~icons/fluent-emoji/check-mark';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';

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
	}

	function getChanges(edit: any, station: any): DiffField[] {
		const fields: DiffField[] = [
			{
				label: 'Warm Sleep Available',
				oldValue: station.hasWarmSleep,
				newValue: edit.hasWarmSleep,
				hasChanged: edit.hasWarmSleep !== null && edit.hasWarmSleep !== station.hasWarmSleep
			},
			{
				label: 'Sleep Notes',
				oldValue: station.sleepNotes,
				newValue: edit.sleepNotes,
				hasChanged: edit.sleepNotes !== null && edit.sleepNotes !== station.sleepNotes
			},
			{
				label: 'Outlets Available',
				oldValue: station.hasOutlets,
				newValue: edit.hasOutlets,
				hasChanged: edit.hasOutlets !== null && edit.hasOutlets !== station.hasOutlets
			},
			{
				label: 'Outlet Notes',
				oldValue: station.outletNotes,
				newValue: edit.outletNotes,
				hasChanged: edit.outletNotes !== null && edit.outletNotes !== station.outletNotes
			},
			{
				label: 'Toilets Available',
				oldValue: station.hasToilets,
				newValue: edit.hasToilets,
				hasChanged: edit.hasToilets !== null && edit.hasToilets !== station.hasToilets
			},
			{
				label: 'Toilet Notes',
				oldValue: station.toiletNotes,
				newValue: edit.toiletNotes,
				hasChanged: edit.toiletNotes !== null && edit.toiletNotes !== station.toiletNotes
			},
			{
				label: 'Toilets Open at Night',
				oldValue: station.toiletsOpenAtNight,
				newValue: edit.toiletsOpenAtNight,
				hasChanged:
					edit.toiletsOpenAtNight !== null && edit.toiletsOpenAtNight !== station.toiletsOpenAtNight
			},
			{
				label: 'Open 24 Hours',
				oldValue: station.isOpen24h,
				newValue: edit.isOpen24h,
				hasChanged: edit.isOpen24h !== null && edit.isOpen24h !== station.isOpen24h
			},
			{
				label: 'Opening Hours',
				oldValue: station.openingHours,
				newValue: edit.openingHours,
				hasChanged: edit.openingHours !== null && edit.openingHours !== station.openingHours
			},
			{
				label: 'Additional Info',
				oldValue: station.additionalInfo,
				newValue: edit.additionalInfo,
				hasChanged: edit.additionalInfo !== null && edit.additionalInfo !== station.additionalInfo
			}
		];

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
			{#each data.pendingEdits as { edit, station, user }}
				{@const changes = getChanges(edit, station)}
				<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h3 class="text-xl font-semibold text-white">{station.name}</h3>
							<p class="text-sm text-white/60">
								{#if data.isAdmin}
									Submitted by {user.name} ({user.email}) on {formatDate(edit.createdAt)}
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
						<a href="/station/{station.eva}" class="text-blue-400 hover:text-blue-300">
							View Station
						</a>
					</div>

					<div class="mb-6 space-y-3">
						{#each changes as change}
							<div class="rounded-lg border border-white/10 bg-black/20 p-4">
								<h4 class="mb-3 font-semibold text-white">{change.label}</h4>
								<div class="space-y-2">
									<div
										class="flex items-start gap-3 rounded border-l-4 border-red-500 bg-red-950/40 px-3 py-2"
									>
										<span class="font-mono text-xs text-red-400">−</span>
										<span class="flex-1 text-sm text-red-200">{formatValue(change.oldValue)}</span>
									</div>
									<div
										class="flex items-start gap-3 rounded border-l-4 border-green-500 bg-green-950/40 px-3 py-2"
									>
										<span class="font-mono text-xs text-green-400">+</span>
										<span class="flex-1 text-sm text-green-200">{formatValue(change.newValue)}</span
										>
									</div>
								</div>
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

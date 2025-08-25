<script lang="ts">
	import FluentEmojiFloppyDisk from '~icons/fluent-emoji/floppy-disk';
	import FluentEmojiRoundPushpin from '~icons/fluent-emoji/round-pushpin';
	import FluentEmojiWorldMap from '~icons/fluent-emoji/world-map';
	import FluentEmojiWastebasket from '~icons/fluent-emoji/wastebasket';
	import FluentEmojiEye from '~icons/fluent-emoji/eye';
	import FluentEmojiPlus from '~icons/fluent-emoji/plus';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';
	import type { MapSource } from '$lib/MapSource';

	const {
		displayLegend,
		isCapturingScreenshot,
		mapSources,
		selectedMapIndex,
		onAddCircle,
		onToggleLegend,
		onCaptureScreenshot,
		onOpenMapModal,
		onSwitchMap,
		onRemoveCustomMap,
		onClearCirclesAndLegend,
		isMobile
	} = $props<{
		displayLegend: boolean;
		isCapturingScreenshot: boolean;
		mapSources: MapSource[];
		selectedMapIndex: number;
		onAddCircle: () => void;
		onToggleLegend: () => void;
		onCaptureScreenshot: () => Promise<void>;
		onOpenMapModal: () => void;
		onSwitchMap: (index: number) => void;
		onRemoveCustomMap: (index: number) => void;
		onClearCirclesAndLegend: () => void;
		isMobile: boolean;
	}>();

	let showMobilePanel = $state(false);

	const handleActionClick = (callback: () => void | Promise<void>) => {
		return async () => {
			await callback();
			if (isMobile) {
				showMobilePanel = false;
			}
		};
	};

	const handleMapSwitch = (index: number) => {
		onSwitchMap(index);
		if (isMobile) {
			showMobilePanel = false;
		}
	};

	const tools = [
		{ id: 'marker', icon: FluentEmojiRoundPushpin, label: 'Add Marker', action: onAddCircle },
		{
			id: 'legend',
			icon: FluentEmojiEye,
			label: 'Toggle Legend',
			action: onToggleLegend,
			active: displayLegend
		},
		{
			id: 'screenshot',
			icon: FluentEmojiFloppyDisk,
			label: 'Capture Screenshot',
			action: onCaptureScreenshot,
			loading: isCapturingScreenshot
		},
		{ id: 'add-map', icon: FluentEmojiPlus, label: 'Add Custom Map', action: onOpenMapModal },
		{ id: 'select-map', icon: FluentEmojiWorldMap, label: 'Select Map', dropdown: true }
	];
</script>

{#if !isMobile}
	<div
		class="bg-base-300 absolute top-0 left-0 z-20 flex h-full w-16 flex-col items-center gap-2 py-4 shadow-lg"
	>
		<div class="tooltip tooltip-right" data-tip="Add Marker">
			<button class="btn btn-ghost btn-sm" onclick={onAddCircle}>
				<FluentEmojiRoundPushpin class="size-6" />
			</button>
		</div>

		<div class="tooltip tooltip-right" data-tip="Toggle Legend">
			<button
				class="btn btn-ghost btn-sm {displayLegend
					? 'btn-active bg-primary text-primary-content'
					: ''}"
				onclick={onToggleLegend}
			>
				<FluentEmojiEye class="size-6" />
			</button>
		</div>

		<div class="tooltip tooltip-right" data-tip="Download Screenshot">
			<button
				class="btn btn-ghost btn-sm"
				onclick={onCaptureScreenshot}
				disabled={isCapturingScreenshot}
			>
				{#if isCapturingScreenshot}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<FluentEmojiFloppyDisk class="size-6" />
				{/if}
			</button>
		</div>

		<div class="tooltip tooltip-right" data-tip="Add Custom Map">
			<button class="btn btn-ghost btn-sm" onclick={onOpenMapModal}>
				<FluentEmojiPlus class="size-6" />
			</button>
		</div>

		<div class="tooltip tooltip-right" data-tip="Select Map">
			<div class="dropdown dropdown-right">
				<label tabindex="0" class="btn btn-ghost btn-sm">
					<FluentEmojiWorldMap class="size-6" />
				</label>
				<ul
					tabindex="0"
					class="dropdown-content menu bg-base-100 rounded-box z-[1] ml-2 max-h-80 w-64 overflow-y-auto p-1 shadow"
				>
					{#each mapSources as source, index}
						<li class="p-1">
							<div
								class="flex w-full items-center justify-between {selectedMapIndex === index
									? 'bg-primary text-primary-content'
									: ''}"
							>
								<button class="flex-1 text-left text-sm" onclick={() => onSwitchMap(index)}>
									<span class="truncate overflow-ellipsis">{source.name}</span>
								</button>

								{#if source.isCustom}
									<button
										class="btn btn-ghost btn-xs"
										onclick={(e) => {
											e.stopPropagation();
											onRemoveCustomMap(index);
										}}
										title="Remove custom map"
									>
										<FluentEmojiCrossMark class="size-3" />
									</button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="flex-1"></div>

		<div class="tooltip tooltip-right" data-tip="Clear Circles & Legend">
			<button class="btn btn-ghost btn-sm text-error" onclick={onClearCirclesAndLegend}>
				<FluentEmojiWastebasket class="size-6" />
			</button>
		</div>
	</div>
{:else}
	<!-- Mobile: Minimal floating action button with simple panel -->
	<div class="fixed bottom-5 left-5 z-50">
		<!-- FAB -->
		<button
			class="btn btn-circle bg-base-100/90 size-12 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
			onclick={() => (showMobilePanel = !showMobilePanel)}
		>
			<div class="transform transition-transform duration-300 {showMobilePanel ? 'rotate-45' : ''}">
				<FluentEmojiPlus class="text-base-content size-5" />
			</div>
		</button>

		<!-- Simple action panel -->
		{#if showMobilePanel}
			<div class="animate-in fade-in slide-in-from-bottom-2 absolute bottom-16 left-0 duration-200">
				<div class="bg-base-100/95 w-72 rounded-2xl p-2 shadow-xl backdrop-blur-xl">
					<!-- Action buttons -->
					<div class="mb-4 grid grid-cols-2 gap-3">
						<button
							class="btn btn-ghost hover:bg-primary/10 h-16 flex-col gap-1 rounded-xl"
							onclick={handleActionClick(onAddCircle)}
						>
							<FluentEmojiRoundPushpin class="text-primary size-6" />
							<span class="text-xs">Marker</span>
						</button>

						<button
							class="btn btn-ghost hover:bg-primary/10 h-16 flex-col gap-1 rounded-xl {displayLegend
								? 'bg-primary/20'
								: ''}"
							onclick={handleActionClick(onToggleLegend)}
						>
							<FluentEmojiEye
								class="size-6 {displayLegend ? 'text-primary' : 'text-base-content/70'}"
							/>
							<span class="text-xs">Legend</span>
						</button>

						<button
							class="btn btn-ghost hover:bg-primary/10 h-16 flex-col gap-1 rounded-xl"
							onclick={handleActionClick(onCaptureScreenshot)}
							disabled={isCapturingScreenshot}
						>
							{#if isCapturingScreenshot}
								<span class="loading loading-spinner loading-sm text-primary"></span>
							{:else}
								<FluentEmojiFloppyDisk class="text-primary size-6" />
							{/if}
							<span class="text-xs">Screenshot</span>
						</button>

						<button
							class="btn btn-ghost hover:bg-primary/10 h-16 flex-col gap-1 rounded-xl"
							onclick={handleActionClick(onOpenMapModal)}
						>
							<FluentEmojiPlus class="text-primary size-6" />
							<span class="text-xs">Add Map</span>
						</button>
					</div>

					<!-- Map list -->
					<div class="max-h-32 space-y-1 overflow-y-auto">
						{#each mapSources as source, index}
							<div
								class="hover:bg-base-200/50 flex items-center gap-2 rounded-lg p-2 {selectedMapIndex ===
								index
									? 'bg-primary/20'
									: ''}"
							>
								{#if selectedMapIndex === index}<FluentEmojiWorldMap
										class="text-primary size-5"
									/>{/if}
								<button
									class="flex-1 truncate text-left text-sm"
									onclick={() => handleMapSwitch(index)}
								>
									{source.name}
								</button>
								{#if source.isCustom}
									<button
										class="btn btn-ghost btn-xs text-error h-6 w-6 p-0"
										onclick={(e) => {
											e.stopPropagation();
											onRemoveCustomMap(index);
										}}
									>
										<FluentEmojiCrossMark class="size-3" />
									</button>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Clear button -->
					<button
						class="btn btn-ghost text-error hover:bg-error/10 mt-3 w-full rounded-xl"
						onclick={handleActionClick(onClearCirclesAndLegend)}
					>
						<FluentEmojiWastebasket class="size-5" />
						Clear
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Mobile backdrop -->
	{#if showMobilePanel}
		<div
			class="animate-in fade-in fixed inset-0 z-40 bg-black/20 backdrop-blur-sm duration-300"
			onclick={() => (showMobilePanel = false)}
		></div>
	{/if}
{/if}

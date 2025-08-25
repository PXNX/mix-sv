<script lang="ts">
	import FluentEmojiPlus from '~icons/fluent-emoji/plus';

	const { showModal, mapName, mapUrl, onAddMap, onClose, onUpdateMapName, onUpdateMapUrl } =
		$props<{
			showModal: boolean;
			mapName: string;
			mapUrl: string;
			onAddMap: () => void;
			onClose: () => void;
			onUpdateMapName: (name: string) => void;
			onUpdateMapUrl: (url: string) => void;
		}>();
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-md">
			<div class="mb-6 flex items-center gap-3">
				<FluentEmojiPlus class="size-5" />
				<h3 class="text-xl font-bold">Add Custom Map</h3>
			</div>

			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Map Name</span>
					</label>
					<input
						type="text"
						placeholder="e.g., My Custom Map"
						class="input input-bordered focus:input-primary w-full"
						value={mapName}
						oninput={(e) => onUpdateMapName(e.currentTarget.value)}
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Map URL</span>
						<span class="label-text-alt text-base-content/60">Embed or iframe URL</span>
					</label>
					<input
						type="url"
						placeholder="https://example.com/map/embed"
						class="input input-bordered focus:input-primary w-full"
						value={mapUrl}
						oninput={(e) => onUpdateMapUrl(e.currentTarget.value)}
					/>
				</div>
			</div>

			<div class="modal-action mt-8">
				<button class="btn btn-ghost" onclick={onClose}>Cancel</button>
				<button class="btn btn-primary" onclick={onAddMap}> Add Map </button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop" onclick={onClose}>
			<button type="button">close</button>
		</form>
	</div>
{/if}

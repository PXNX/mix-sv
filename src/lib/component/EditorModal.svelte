<script lang="ts">
	import type { Circle } from '$lib/Circle';
	import { presetColors } from '$lib/defaults';
	import FluentEmojiPencil from '~icons/fluent-emoji/pencil';
	import FluentEmojiRoundPushpin from '~icons/fluent-emoji/round-pushpin';

	const { circle, isNew, onCancel, onSave, onRemove, onColorSelect } = $props<{
		circle: Circle;
		isNew: boolean;
		onCancel: () => void;
		onSave: (updated: Circle) => void;
		onRemove: (circleId: number) => void;
		onColorSelect: (colorIndex: number) => void;
	}>();
</script>

<div
	class="bg-opacity- fixed inset-0 z-50 flex items-center justify-center bg-black"
	onclick={onCancel}
>
	<div
		class="bg-base-100 text-base-content w-80 rounded p-6 shadow"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="mb-6 flex items-center gap-3">
			{#if isNew}<FluentEmojiRoundPushpin class="size-5" />{:else}
				<FluentEmojiPencil class="size-5" />{/if}

			<h3 class="text-xl font-bold">
				{#if isNew}Create{:else}
					Edit{/if} Point
			</h3>
		</div>

		<label class="form-control mb-3">
			<span class="label-text">Headline</span>
			<input type="text" class="input input-bordered" bind:value={circle.headline} />
		</label>

		<label class="form-control mb-3">
			<span class="label-text">Text</span>
			<input type="text" class="input input-bordered" bind:value={circle.text} />
		</label>

		<label class="form-control mb-5">
			<span class="label-text">Color</span>
			<div class="mt-2 flex gap-2">
				{#each presetColors as colorOption, index}
					<button
						class="size-8 cursor-pointer rounded-full border-2 border-transparent transition-all"
						class:ring-2={circle?.colorIndex === index}
						class:ring-offset-2={circle?.colorIndex === index}
						class:shadow-md={circle?.colorIndex === index}
						class:animate-bounce-once={circle?.colorIndex === index}
						style="background-color: {colorOption.color};"
						onclick={() => onColorSelect(index)}
					></button>
				{/each}
			</div>
		</label>

		<label class="mb-3 flex items-center gap-2">
			<input type="checkbox" bind:checked={circle.rectExpandLeft} class="checkbox" />
			<span>Expand label left</span>
		</label>

		<label class="mb-4 flex items-center gap-2">
			<input type="checkbox" class="checkbox" bind:checked={circle.useDottedBorder} />
			<span>Dotted border</span>
		</label>

		<div class="mt-4 flex justify-end space-x-2">
			<button class="btn btn-ghost" onclick={onCancel}>Cancel</button>

			{#if !isNew}
				<button class="btn btn-error" onclick={() => onRemove(circle!.id)}>Remove</button>
			{/if}

			<button class="btn btn-primary" onclick={() => onSave(circle)}>
				{isNew ? 'Add Point' : 'Save'}
			</button>
		</div>
	</div>
</div>

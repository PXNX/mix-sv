<script lang="ts">
	import { presetColors } from '$lib/defaults';

	const { entries = [], onChange } = $props<{
		entries: [number, string][];
		onChange: (colorIndex: number, text: string) => void;
	}>();
</script>

<div class="bg-base-200 absolute right-0 bottom-0 z-10 space-y-3 rounded-tl-lg p-3">
	{#each entries as [colorIndex, text]}
		<div class=" flex items-center gap-2">
			<div
				class="h-5 w-5 rounded-full border-3"
				style="border-color: {presetColors[colorIndex].color}"
			></div>
			<input
				class="  text-sm"
				type="text"
				value={text}
				oninput={(e) => onChange(colorIndex, e.target.value)}
			/>
		</div>
	{/each}
</div>

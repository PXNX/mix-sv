<script lang="ts">
	import type { Circle } from '$lib/Circle';
	import { presetColors } from '$lib/defaults';

	const { circle, onDragStart, onEdit } = $props<{
		circle: Circle;
		onDragStart: (e: MouseEvent, id: number) => void;
		onEdit: (circle: Circle) => void;
	}>();
	const fontColor = $derived(presetColors[circle.colorIndex]?.useDarkFont ? '#000000' : '#ffffff');
	const backgroundColor = $derived(presetColors[circle.colorIndex]?.color);
</script>

<div
	class="absolute z-10"
	style="top: {circle.y}%; left: {circle.x}%; transform: translate(-50%, -50%);"
>
	<div
		class="size-16 cursor-move rounded-full border-4"
		style="border-color: {backgroundColor};"
		onmousedown={(e) => onDragStart(e, circle.id)}
		ondrag={(e) => onDragStart(e, circle.id)}
		class:border-dotted={circle.useDottedBorder}
		class:border-solid={!circle.useDottedBorder}
	></div>
	<button
		type="button"
		class="text-md absolute cursor-pointer px-2 py-1"
		class:rounded-l={circle.rectExpandLeft}
		class:rounded-r={!circle.rectExpandLeft}
		class:rounded={circle.headline}
		style="
            top: 50%;
            {circle.rectExpandLeft
			? 'right: 93%; text-align: right;'
			: 'left: 93%; text-align: left;'}
            transform: translateY(-50%);
            background-color: {backgroundColor};
            color: {fontColor};
        "
		onclick={() => onEdit(circle)}
	>
		{#if circle.headline}
			<div class="truncate text-base font-bold whitespace-nowrap">{circle.headline}</div>
		{/if}
		<div class="truncate whitespace-nowrap">{circle.text}</div>
	</button>
</div>

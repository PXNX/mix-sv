<script lang="ts">
	import { onMount } from 'svelte';
	import type { Circle } from '$lib/Circle';
	import CircleItem from '$lib/component/CircleItem.svelte';
	import Branding from '$lib/component/Branding.svelte';
	import Legend from './Legend.svelte';
	import type { Readable } from 'svelte/store';

	const {
		currentMapUrl,
		circles,

		onCircleEdit,
		onCirclesUpdate,
		displayLegend,
		legendTexts,
		activeLegendEntries,
		isMobile
	} = $props<{
		currentMapUrl: string;
		circles: Circle[];

		onCircleEdit: (circle: Circle) => void;
		onCirclesUpdate: (updatedCircles: Circle[]) => void;
		displayLegend: boolean;
		legendTexts: Map<number, string>;
		activeLegendEntries: Readable<[number, string][]>;
		isMobile: boolean;
	}>();

	let isMapLoading = $state(true);
	let iframeRef: HTMLIFrameElement | null = null;
	let draggingId: number | null = $state(null);
	let dragStarted = $state(false);

	function handleMouseDown(event: MouseEvent, id: number) {
		draggingId = id;
		dragStarted = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (draggingId === null) return;

		dragStarted = true;

		const container = event.currentTarget as HTMLElement;
		const rect = container.getBoundingClientRect();

		let x = ((event.clientX - rect.left) / rect.width) * 100;
		let y = ((event.clientY - rect.top) / rect.height) * 100;

		const circleSizeX = (56 / rect.width) * 100;
		const circleSizeY = (56 / rect.height) * 100;
		const margin = 2;
		const minX = margin + circleSizeX / 2;
		const maxX = 100 - margin - circleSizeX / 2;
		const minY = margin + circleSizeY / 2;
		const maxY = 100 - margin - circleSizeY / 2;

		x = Math.min(maxX, Math.max(minX, x));
		y = Math.min(maxY, Math.max(minY, y));

		const updatedCircles = circles.map((circle) =>
			circle.id === draggingId ? { ...circle, x, y } : circle
		);
		onCirclesUpdate(updatedCircles); // Emit event to update parent store
	}

	function handleMouseUp() {
		if (draggingId === null) return;

		if (!dragStarted) {
			const circle = circles.find((c) => c.id === draggingId);
			if (circle) onCircleEdit(circle);
		}

		draggingId = null;
		dragStarted = false;
	}

	// Watch currentMapUrl changes to force iframe reload
	$effect(() => {
		isMapLoading = true;
		if (iframeRef) {
			iframeRef.src = ''; // Clear src to force reload
			setTimeout(() => {
				if (iframeRef) {
					iframeRef.src = currentMapUrl;
				}
			}, 100);
		}
	});

	onMount(() => {
		const handleIframeLoad = () => {
			isMapLoading = false;
		};

		iframeRef?.addEventListener('load', handleIframeLoad);

		return () => {
			iframeRef?.removeEventListener('load', handleIframeLoad);
		};
	});
</script>

<div
	class="relative h-screen flex-grow overflow-hidden"
	class:ml-16={!isMobile}
	id="container"
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
>
	<div class=" z-0 h-full w-full">
		{#if isMapLoading}
			<div class="bg-base-100 absolute inset-0 z-10 flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<span class="loading loading-spinner loading-lg text-primary"></span>
					<p class="text-base-content/70">Loading map...</p>
				</div>
			</div>
		{/if}

		<iframe
			bind:this={iframeRef}
			src={currentMapUrl}
			class="h-full w-full"
			loading="lazy"
			allowfullscreen
			title="Interactive Map"
			allow="display-capture"
			onload={() => (isMapLoading = false)}
		></iframe>
	</div>

	{#each circles as circle (circle.id)}
		<CircleItem {circle} onDragStart={(e) => handleMouseDown(e, circle.id)} onEdit={onCircleEdit} />
	{/each}

	{#if displayLegend && $activeLegendEntries.length > 0}
		<Legend
			entries={$activeLegendEntries}
			onChange={(colorIndex, value) => {
				const map = new Map($legendTexts);
				map.set(colorIndex, value);
				legendTexts.set(map);
			}}
		/>
	{/if}

	<Branding {isMobile} />
</div>

<script lang="ts">
	import type { Circle } from '$lib/Circle';

	// Svelte Components
	import Sidebar from '$lib/component/Sidebar.svelte';
	import EditorModal from '$lib/component/EditorModal.svelte';
	import MapContainer from '$lib/component/MapContainer.svelte';
	import MapModal from '$lib/component/MapModal.svelte';

	// Svelte Stores and Utilities
	import { writable, derived } from 'svelte/store';
	import { captureScreenshot } from '$lib/utils/screenshotUtils';
	import { createPersistentState } from '$lib/utils/storeutils';
	import { defaultMapSources } from '$lib/defaults';

	let isMobile = $state(false);

	$effect(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	// --- Initial State Definitions ---
	const [initialDisplayLegend, saveDisplayLegend] = createPersistentState('displayLegend', true);
	let displayLegend = $state(initialDisplayLegend);

	const [initialMapSources, saveMapSources] = createPersistentState(
		'customMapSources',
		defaultMapSources
	);
	let mapSources = $state(initialMapSources);

	const [initialSelectedMapIndex, saveSelectedMapIndex] = createPersistentState(
		'selectedMapIndex',
		0,
		String,
		Number
	);
	let selectedMapIndex = $state(initialSelectedMapIndex);

	const [initialCircles, saveCircles] = createPersistentState<Circle[]>('mapCircles', []);
	const circles = writable<Circle[]>(initialCircles);

	const [initialLegendTexts, saveLegendTexts] = createPersistentState<Map<number, string>>(
		'mapLegendTexts',
		new Map(),
		(map) => JSON.stringify(Object.fromEntries(map)),
		(json) => new Map(Object.entries(JSON.parse(json)))
	);
	const legendTexts = writable<Map<number, string>>(initialLegendTexts);

	const [initialNextId, saveNextId] = createPersistentState('nextCircleId', 1, String, Number);
	let nextId = $state(initialNextId);

	// --- Reactive State ($state, $derived) ---
	let isAddingCircle = $state(false);
	let showMapModal = $state(false);
	let newMapName = $state('');
	let newMapUrl = $state('');
	let isCapturingScreenshot = $state(false);
	let editingCircle: Circle | null = $state(null);

	const currentMapUrl = $derived(mapSources[selectedMapIndex]?.url || '');

	const usedColors = derived(circles, ($circles) => {
		return new Set($circles.map((c) => c.colorIndex));
	});

	const activeLegendEntries = derived([usedColors, legendTexts], ([$usedColors, $legendTexts]) => {
		return Array.from($legendTexts.entries()).filter(([colorIndex]) => $usedColors.has(colorIndex));
	});

	// --- Side Effects ($effect and Store Subscriptions) ---
	circles.subscribe(($circles) => {
		saveCircles($circles);
	});

	legendTexts.subscribe(($legendTexts) => {
		saveLegendTexts($legendTexts);
	});

	$effect(() => {
		saveDisplayLegend(displayLegend);
	});

	$effect(() => {
		saveSelectedMapIndex(selectedMapIndex);
	});

	$effect(() => {
		saveMapSources(mapSources);
	});

	$effect(() => {
		saveNextId(nextId);
	});

	// --- Functions ---

	// Custom Map Management
	function openMapModal() {
		showMapModal = true;
		newMapName = '';
		newMapUrl = '';
	}

	function closeMapModal() {
		showMapModal = false;
		newMapName = '';
		newMapUrl = '';
	}

	function handleUpdateMapName(name: string) {
		newMapName = name;
	}

	function handleUpdateMapUrl(url: string) {
		newMapUrl = url;
	}

	function addCustomMap() {
		if (!newMapName.trim() || !newMapUrl.trim()) {
			alert('Please provide both a name and URL for the custom map.');
			return;
		}
		try {
			new URL(newMapUrl);
		} catch {
			alert('Please provide a valid URL.');
			return;
		}

		const newMap = {
			id: `custom-${Date.now()}`,
			name: newMapName.trim(),
			url: newMapUrl.trim(),
			isCustom: true
		};

		mapSources = [...mapSources, newMap];
		// saveMapSources is handled by $effect
		closeMapModal();
	}

	function removeCustomMap(index: number) {
		if (
			mapSources[index]?.isCustom &&
			confirm('Are you sure you want to remove this custom map?')
		) {
			if (selectedMapIndex === index) {
				selectedMapIndex = 0;
			} else if (selectedMapIndex > index) {
				selectedMapIndex--;
			}
			mapSources = mapSources.filter((_, i) => i !== index);
			// saveMapSources is handled by $effect
		}
	}

	function switchMapByIndex(index: number) {
		selectedMapIndex = index;
	}

	// Circle Management
	function addCircle() {
		const newCircle: Circle = {
			id: nextId,
			x: 50,
			y: 50,
			text: 'Edit text...',
			colorIndex: 0,
			rectExpandLeft: false,
			headline: '',
			useDottedBorder: false
		};

		nextId++; // saveNextId is handled by $effect
		isAddingCircle = true;
		openEditor(newCircle);
	}

	function removeCircle(id: number) {
		circles.update((c) => c.filter((circle) => circle.id !== id));
		editingCircle = null;
	}

	function saveEditor() {
		if (!editingCircle) return;

		circles.update((c) =>
			isAddingCircle
				? [...c, editingCircle]
				: c.map((circle) => (circle.id === editingCircle!.id ? editingCircle : circle))
		);

		legendTexts.update((map) => {
			if (!map.has(editingCircle!.colorIndex)) {
				map.set(editingCircle!.colorIndex, `Edit description...`);
			}
			return new Map(map); // force reactivity
		});

		isAddingCircle = false;
		editingCircle = null;
	}

	function openEditor(circle: Circle) {
		editingCircle = { ...circle };
	}

	function cancelEditor() {
		editingCircle = null;
		isAddingCircle = false;
	}

	function selectColor(colorIndex: number) {
		if (editingCircle) {
			editingCircle.colorIndex = colorIndex;
		}
	}

	function handleCirclesUpdate(updatedCircles: Circle[]) {
		circles.set(updatedCircles);
	}

	// Data Clearing
	function clearCirclesAndLegend() {
		if (
			confirm(
				'Are you sure you want to clear all circles and legend texts? This action cannot be undone.'
			)
		) {
			circles.set([]);
			legendTexts.set(new Map());
			nextId = 1; // saveNextId is handled by $effect
			// Explicitly clear localStorage items if desired, though stores subscribing to empty arrays/maps will also save
			try {
				localStorage.removeItem('mapCircles');
				localStorage.removeItem('mapLegendTexts');
				localStorage.removeItem('nextCircleId');
			} catch (error) {
				console.warn('Could not clear localStorage:', error);
			}
		}
	}

	async function captureWithHtml2Canvas() {
		try {
			isCapturingScreenshot = true;

			const response = await fetch('/api/export', {
				method: 'POST',
				body: JSON.stringify('{1,2 }'),
				headers: {
					'content-type': 'application/json'
				}
			});

			let total = await response.json();
			console.log(total);
		} catch (error) {
			console.error('html2canvas failed:', error);
			alert(
				"Screenshot capture failed. Please try using your browser's built-in screenshot tools."
			);
		} finally {
			isCapturingScreenshot = false;
		}
	}
</script>

<svelte:head>
	<title>MN Map</title>
</svelte:head>

<Sidebar
	{displayLegend}
	{isCapturingScreenshot}
	{mapSources}
	{selectedMapIndex}
	onAddCircle={addCircle}
	onToggleLegend={() => (displayLegend = !displayLegend)}
	onCaptureScreenshot={captureWithHtml2Canvas}
	onOpenMapModal={openMapModal}
	onSwitchMap={switchMapByIndex}
	onRemoveCustomMap={removeCustomMap}
	onClearCirclesAndLegend={clearCirclesAndLegend}
	{isMobile}
/>

<MapContainer
	{currentMapUrl}
	circles={$circles}
	onCircleEdit={openEditor}
	onCirclesUpdate={handleCirclesUpdate}
	{displayLegend}
	legendTexts={$legendTexts}
	{activeLegendEntries}
	{isMobile}
/>

{#if editingCircle}
	<EditorModal
		circle={editingCircle}
		isNew={isAddingCircle}
		onCancel={cancelEditor}
		onSave={saveEditor}
		onRemove={() => removeCircle(editingCircle?.id!)}
		onColorSelect={selectColor}
	/>
{/if}

<MapModal
	showModal={showMapModal}
	mapName={newMapName}
	mapUrl={newMapUrl}
	onAddMap={addCustomMap}
	onClose={closeMapModal}
	onUpdateMapName={handleUpdateMapName}
	onUpdateMapUrl={handleUpdateMapUrl}
/>

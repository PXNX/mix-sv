<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	type Props = {
		children: () => any;
		onMouseMove: MouseEventHandler<HTMLElement>;
		onMouseUp: MouseEventHandler<HTMLElement>;
	};

	let { children, onMouseMove, onMouseUp }: Props = $props();
</script>

<div
	class="relative container h-screen w-full overflow-hidden"
	id="container"
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
>
	{@render children()}
</div>

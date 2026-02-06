<script lang="ts">
	type PinType = {
		position: {
			left: string;
			top: string;
		};
		height: string;
		width: string;
	};

	let { pin = $bindable() }: { pin: PinType } = $props();

	let isDragging = $state(false);
	let hasMoved = $state(false);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let startX = $state(0);
	let startY = $state(0);
	const DRAG_THRESHOLD = 5; // pixels

	function startDrag(event: MouseEvent) {
		console.log('Start drag');
		event.stopPropagation();
		isDragging = true;
		hasMoved = false;

		const button = event.currentTarget as HTMLElement;
		const container = button.parentElement as HTMLElement;
		const rect = container.getBoundingClientRect();

		const currentLeft = parseInt(pin.position.left) || 0;
		const currentTop = parseInt(pin.position.top) || 0;

		startX = event.clientX;
		startY = event.clientY;

		offsetX = event.clientX - rect.left - currentLeft;
		offsetY = event.clientY - rect.top - currentTop;
	}

	function onDrag(event: MouseEvent) {
		if (!isDragging) return;
		event.preventDefault();

		// Check if mouse moved beyond threshold
		const deltaX = Math.abs(event.clientX - startX);
		const deltaY = Math.abs(event.clientY - startY);

		if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
			hasMoved = true;
		}

		if (!hasMoved) return;

		const button = document.querySelector('button[title="pin"]') as HTMLElement;
		if (!button) return;

		const container = button.parentElement as HTMLElement;
		const rect = container.getBoundingClientRect();

		pin.position = {
			left: (event.clientX - rect.left - offsetX).toString(),
			top: (event.clientY - rect.top - offsetY).toString()
		};
	}

	function stopDrag(event: MouseEvent) {
		if (isDragging && hasMoved) {
			if (!hasMoved) {
				// This was a single click, not a drag
				console.log('Pin clicked! Open window here');
				// TODO: Open information window
			}

			event.stopPropagation();
			event.preventDefault();
		}
		isDragging = false;
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		if (hasMoved) {
			return;
		} else {
		}
		hasMoved = false;
	}
</script>

<svelte:window onmousemove={onDrag} onmouseup={stopDrag} />

<button
	title="pin"
	onmousedown={startDrag}
	onclick={handleClick}
	style="left: {pin.position.left}px; top: {pin.position.top}px;"
>
	<div
		class="pin"
		style="
    width: {pin.width}; 
    height: {pin.height};
    "
	></div>
</button>

<style>
	button {
		background: none;
		border: none;
		padding: 0;
		cursor: move;
		position: absolute;
		transform: translate(-50%, -50%);
	}

	.pin {
		border-style: solid;
		background-color: aqua;
		border-radius: 100%;
	}
</style>

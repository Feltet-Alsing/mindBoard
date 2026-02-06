<script lang="ts">
	type PinType = {
		position: {
			left: string;
			top: string;
		};
		height: string;
		width: string;
		title: string;
		content: string;
		color: string;
		label: string;
		connections: number[];
	};

	let {
		pin = $bindable(),
		onDelete,
		onStartConnection,
		onFinishConnection,
		onCancelConnection,
		onUpdatePreview,
		onOpenModal,
		pins = [],
		pinIndex = -1
	}: {
		pin: PinType;
		onDelete: () => void;
		onStartConnection: () => void;
		onFinishConnection: () => void;
		onCancelConnection: () => void;
		onUpdatePreview: (x: number, y: number) => void;
		onOpenModal?: () => void;
		pins?: PinType[];
		pinIndex?: number;
	} = $props();

	let isDragging = $state(false);
	let hasMoved = $state(false);
	let isOutsideBounds = $state(false);
	let isConnecting = $state(false);
	let justDeleted = $state(false);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let startX = $state(0);
	let startY = $state(0);
	const DRAG_THRESHOLD = 5; // pixels

	function startDrag(event: MouseEvent) {
		event.stopPropagation();

		// If shift is held, start connection mode
		if (event.shiftKey) {
			isConnecting = true;
			onStartConnection();
			return;
		}

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
		// Stop immediately if not dragging
		if (!isDragging && !event.shiftKey) return;

		// Update connection preview position
		if (event.shiftKey) {
			const button = document.querySelector('button[title="pin"]') as HTMLElement;
			if (button) {
				const container = button.parentElement as HTMLElement;
				const rect = container.getBoundingClientRect();
				onUpdatePreview(event.clientX - rect.left, event.clientY - rect.top);
			}
			return;
		}

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

		const newLeft = event.clientX - rect.left - offsetX;
		const newTop = event.clientY - rect.top - offsetY;

		// Check if pin is outside container bounds
		isOutsideBounds = newLeft < 0 || newTop < 0 || newLeft > rect.width || newTop > rect.height;

		pin.position = {
			left: newLeft.toString(),
			top: newTop.toString()
		};
	}

	function stopDrag(event: MouseEvent) {
		// Check if we're finishing a connection (shift key is held)
		if (event.shiftKey && isConnecting) {
			event.stopPropagation();
			event.preventDefault();
			onFinishConnection();
			isConnecting = false;
			isDragging = false;
			return;
		}

		if (isDragging && hasMoved) {
			// Delete pin if dragged outside container
			if (isOutsideBounds) {
				isDragging = false;
				isOutsideBounds = false;
				hasMoved = false;
				justDeleted = true;
				onDelete();
				return;
			}

			event.stopPropagation();
			event.preventDefault();
		}
		isDragging = false;
		isOutsideBounds = false;
		// Don't reset hasMoved here - let handleClick consume it
	}

	function handleMouseUp(event: MouseEvent) {
		// If shift is held and we're in connecting mode, finish the connection to this pin
		if (event.shiftKey && !isDragging) {
			event.stopPropagation();
			event.preventDefault();
			onFinishConnection();
			isConnecting = false;
		}
	}

	function handleClick(event: MouseEvent) {
		// Don't handle clicks if we just deleted
		if (justDeleted) {
			justDeleted = false;
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		// Check if we're finishing a connection
		if (event.shiftKey) {
			onFinishConnection();
			return;
		}

		if (!hasMoved) {
			onOpenModal?.();
		}
		hasMoved = false;
	}
</script>

<svelte:window onmousemove={onDrag} onmouseup={stopDrag} />

<button
	title="pin"
	onmousedown={startDrag}
	onmouseup={handleMouseUp}
	onclick={handleClick}
	style="left: {pin.position.left}px; top: {pin.position.top}px;"
>
	<div
		class="pin"
		class:outside={isOutsideBounds}
		style="width: {pin.width}; height: {pin.height}; background-color: {pin.color};"
	>
		{#if pin.label}
			<span class="pin-label">{pin.label}</span>
		{/if}
	</div>
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
		border-radius: 100%;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.pin.outside {
		background-color: #ff6b6b !important;
		opacity: 0.7;
	}

	.pin-label {
		font-size: 10px;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		text-align: center;
		max-width: 80%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrapbackground-color 0.2s;
	}

	.pin.outside {
		background-color: #ff6b6b;
		opacity: 0.7;
	}
</style>

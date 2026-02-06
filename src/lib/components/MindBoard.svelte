<script lang="ts">
	import Pin from './Pin.svelte';
	import PinCreationMenu from './PinCreationMenu.svelte';
	import PinModal from './PinModal.svelte';

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
		connections: number[]; // Array of pin indices this pin is connected to
	};

	let { initialPins = [] }: { initialPins?: PinType[] } = $props();

	let pins: PinType[] = $state(initialPins);
	let showCreationMenu = $state(false);
	let menuPosition = $state({ x: 0, y: 0, boardX: 0, boardY: 0 });
	let isConnecting = $state(false);
	let connectingFrom = $state<number | null>(null);
	let connectionPreview = $state<{ x: number; y: number } | null>(null);
	let justFinishedConnection = $state(false);
	let saveTimeout: number | null = null;
	let mountTimestamp = Date.now();

	// Zoom and pan state
	let zoom = $state(1);
	let pan = $state({ x: 0, y: 0 });
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let panStartOffset = $state({ x: 0, y: 0 });
	let spacePressed = $state(false);
	let didPan = $state(false);
	let isAnyModalOpen = $state(false);
	let openModalPinIndex = $state<number | null>(null);

	// Convert screen coordinates to board coordinates
	function screenToBoard(screenX: number, screenY: number) {
		return {
			x: (screenX - pan.x) / zoom,
			y: (screenY - pan.y) / zoom
		};
	}

	$effect(() => {
		const currentPins = $state.snapshot(pins);

		if (Date.now() - mountTimestamp < 500) {
			return;
		}

		if (saveTimeout !== null) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(async () => {
			const formData = new FormData();
			formData.append('pins', JSON.stringify(currentPins));

			const response = await fetch('?/savePins', {
				method: 'POST',
				body: formData
			});
		}, 1000) as unknown as number;
	});

	function handleBoardClick(event: MouseEvent) {
		// Don't open menu if we just finished a connection or are in connecting mode
		if (isConnecting || justFinishedConnection) {
			cancelConnection();
			justFinishedConnection = false;
			return;
		}

		// Don't open menu if we just finished panning
		if (didPan) {
			didPan = false;
			return;
		}

		// Don't open menu if currently panning
		if (isPanning) {
			return;
		}

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;

		// Convert screen coordinates to board coordinates for pin creation
		const boardCoords = screenToBoard(screenX, screenY);

		// Store board coordinates for pin creation, and absolute screen coords for menu positioning
		menuPosition = { 
			x: event.clientX, // Absolute screen X for fixed positioning
			y: event.clientY, // Absolute screen Y for fixed positioning
			boardX: boardCoords.x, // Board coordinates for pin creation
			boardY: boardCoords.y 
		};
		showCreationMenu = true;
	}

	function createPin(x: number, y: number, label: string, color: string) {
		const pin: PinType = {
			position: { left: x.toString(), top: y.toString() },
			height: '40px',
			width: '40px',
			title: '',
			content: '',
			color: color,
			label: label,
			connections: []
		};

		pins.push(pin);
	}

	function handleConfirmPin(label: string, color: string) {
		createPin(menuPosition.boardX, menuPosition.boardY, label, color);
		showCreationMenu = false;
	}

	function handleCancelPin() {
		showCreationMenu = false;
	}

	function startConnection(index: number) {
		isConnecting = true;
		connectingFrom = index;
	}

	function updateConnectionPreview(x: number, y: number) {
		if (isConnecting) {
			connectionPreview = { x, y };
		}
	}

	function finishConnection(toIndex: number) {
		if (isConnecting && connectingFrom !== null && connectingFrom !== toIndex) {
			// Add connection both ways
			if (!pins[connectingFrom].connections.includes(toIndex)) {
				pins[connectingFrom].connections.push(toIndex);
			}
			if (!pins[toIndex].connections.includes(connectingFrom)) {
				pins[toIndex].connections.push(connectingFrom);
			}
		}
		isConnecting = false;
		connectingFrom = null;
		connectionPreview = null;
		justFinishedConnection = true;

		// Reset the flag after a short delay
		setTimeout(() => {
			justFinishedConnection = false;
		}, 100);
	}

	function cancelConnection() {
		isConnecting = false;
		connectingFrom = null;
		connectionPreview = null;
	}

	function deletePin(index: number) {
		// Remove connections to this pin from other pins
		pins.forEach((pin) => {
			pin.connections = pin.connections.filter((i) => i !== index);
			// Adjust indices for pins after the deleted one
			pin.connections = pin.connections.map((i) => (i > index ? i - 1 : i));
		});
		pins.splice(index, 1);
	}

	// Zoom handler
	function handleWheel(e: WheelEvent) {
		if (!isAnyModalOpen && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();

			const container = e.currentTarget as HTMLElement;
			const rect = container.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Calculate zoom factor
			const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const newZoom = Math.max(0.1, Math.min(4, zoom * zoomFactor));

			// Calculate new pan to keep mouse position fixed
			const boardX = (mouseX - pan.x) / zoom;
			const boardY = (mouseY - pan.y) / zoom;

			pan.x = mouseX - boardX * newZoom;
			pan.y = mouseY - boardY * newZoom;
			zoom = newZoom;
		}
	}

	// Pan handlers
	function handleMouseDown(e: MouseEvent) {
		if (!isAnyModalOpen && ((spacePressed && e.button === 0) || e.button === 1)) {
			e.preventDefault();
			isPanning = true;
			didPan = false;
			panStart = { x: e.clientX, y: e.clientY };
			panStartOffset = { x: pan.x, y: pan.y };
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (isPanning) {
			const dx = e.clientX - panStart.x;
			const dy = e.clientY - panStart.y;

			// Mark that we actually panned if moved more than a few pixels
			if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
				didPan = true;
			}

			pan.x = panStartOffset.x + dx;
			pan.y = panStartOffset.y + dy;
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			isPanning = false;
		}
	}

	// Keyboard handlers for spacebar
	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Space' && !spacePressed) {
			const target = e.target as HTMLElement;
			// Don't capture space in inputs/textareas
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
				return;
			}
			e.preventDefault();
			spacePressed = true;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			spacePressed = false;
			if (isPanning) {
				isPanning = false;
				// Keep didPan flag set so click handler can check it
			}
		}
	}

	// Zoom controls
	function zoomIn() {
		const newZoom = Math.min(4, zoom * 1.2);
		zoom = newZoom;
	}

	function zoomOut() {
		const newZoom = Math.max(0.1, zoom / 1.2);
		zoom = newZoom;
	}

	function resetZoom() {
		zoom = 1;
		pan = { x: 0, y: 0 };
	}
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div class="viewport">
	<!-- Zoom controls -->
	<div class="zoom-controls">
		<button onclick={zoomIn} aria-label="Zoom in" title="Zoom in">+</button>
		<span class="zoom-level">{Math.round(zoom * 100)}%</span>
		<button onclick={zoomOut} aria-label="Zoom out" title="Zoom out">−</button>
		<button onclick={resetZoom} aria-label="Reset zoom" title="Reset zoom (100%)">⟲</button>
	</div>

	<div
		class="container"
		class:panning={isPanning || spacePressed}
		onclick={handleBoardClick}
		onwheel={handleWheel}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			// Don't trigger if focus is on an input, button, or other interactive element
			const target = e.target as HTMLElement;
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'BUTTON' ||
				target.tagName === 'TEXTAREA'
			) {
				return;
			}

			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleBoardClick(e as unknown as MouseEvent);
			}
		}}
		aria-label="Mind board canvas - click to add pin"
	>
		<div class="board" style="transform: translate({pan.x}px, {pan.y}px) scale({zoom});">
			<!-- SVG layer for connections -->
			<svg class="connections-layer">
				{#each pins as pin, i (i)}
					{#each pin.connections as connectedIndex (connectedIndex)}
						{#if i < connectedIndex && pins[connectedIndex]}
							<!-- Only draw each connection once -->
							<line
								x1={parseFloat(pin.position.left)}
								y1={parseFloat(pin.position.top)}
								x2={parseFloat(pins[connectedIndex].position.left)}
								y2={parseFloat(pins[connectedIndex].position.top)}
								stroke="#333"
								stroke-width="2"
							/>
						{/if}
					{/each}
				{/each}

				<!-- Connection preview line -->
				{#if isConnecting && connectingFrom !== null && connectionPreview}
					<line
						x1={parseFloat(pins[connectingFrom].position.left)}
						y1={parseFloat(pins[connectingFrom].position.top)}
						x2={connectionPreview.x}
						y2={connectionPreview.y}
						stroke="#00bcd4"
						stroke-width="2"
						stroke-dasharray="5,5"
						opacity="0.6"
					/>
				{/if}
			</svg>

			{#each pins as pin, i (i)}
				<Pin
					bind:pin={pins[i]}
					onDelete={() => deletePin(i)}
					onStartConnection={() => startConnection(i)}
					onFinishConnection={() => finishConnection(i)}
					onCancelConnection={cancelConnection}
					onUpdatePreview={updateConnectionPreview}
					onOpenModal={() => {
						openModalPinIndex = i;
						isAnyModalOpen = true;
					}}
					{pins}
					pinIndex={i}
				/>
			{/each}
		</div>
	</div>

	{#if showCreationMenu}
		<PinCreationMenu
			x={menuPosition.x}
			y={menuPosition.y}
			onConfirm={handleConfirmPin}
			onCancel={handleCancelPin}
		/>
	{/if}

	{#if openModalPinIndex !== null && pins[openModalPinIndex]}
		<PinModal
			bind:pin={pins[openModalPinIndex]}
			isOpen={true}
			{pins}
			currentIndex={openModalPinIndex}
			onClose={() => {
				openModalPinIndex = null;
				isAnyModalOpen = false;
			}}
		/>
	{/if}
</div>

<style>
	.viewport {
		position: relative;
		height: 75vh;
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}

	.container {
		height: 100%;
		width: 100%;
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
		border-style: solid;
		position: relative;
		overflow: hidden;
		cursor: default;
	}

	.container.panning {
		cursor: grab;
	}

	.container.panning:active {
		cursor: grabbing;
	}

	.board {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-origin: 0 0;
	}

	.connections-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}

	.zoom-controls {
		position: absolute;
		bottom: 20px;
		right: 20px;
		display: flex;
		gap: 8px;
		align-items: center;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 8px 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		user-select: none;
	}

	.zoom-controls button {
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;
		color: #333;
		transition: all 0.2s;
	}

	.zoom-controls button:hover {
		background: #f5f5f5;
		border-color: #999;
	}

	.zoom-controls button:active {
		background: #e8e8e8;
	}

	.zoom-level {
		font-size: 13px;
		color: #666;
		min-width: 45px;
		text-align: center;
		font-weight: 500;
	}
</style>

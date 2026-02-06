<script lang="ts">
	import Pin from './Pin.svelte';
	import PinCreationMenu from './PinCreationMenu.svelte';

	type Pin = {
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

	let pins: Pin[] = $state([]);
	let showCreationMenu = $state(false);
	let menuPosition = $state({ x: 0, y: 0 });
	let isConnecting = $state(false);
	let connectingFrom = $state<number | null>(null);
	let connectionPreview = $state<{ x: number; y: number } | null>(null);
	let justFinishedConnection = $state(false);

	function handleBoardClick(event: MouseEvent) {
		// Don't open menu if we just finished a connection or are in connecting mode
		if (isConnecting || justFinishedConnection) {
			cancelConnection();
			justFinishedConnection = false;
			return;
		}

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		menuPosition = { x, y };
		showCreationMenu = true;
	}

	function createPin(x: number, y: number, label: string, color: string) {
		const pin: Pin = {
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
		createPin(menuPosition.x, menuPosition.y, label, color);
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
</script>

<div class="container" onclick={handleBoardClick}>
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
			{pins}
			pinIndex={i}
		/>
	{/each}

	{#if showCreationMenu}
		<PinCreationMenu
			x={menuPosition.x}
			y={menuPosition.y}
			onConfirm={handleConfirmPin}
			onCancel={handleCancelPin}
		/>
	{/if}
</div>

<style>
	.container {
		min-height: 75vh;
		min-width: 75vw;
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
		border-style: solid;
		position: relative;
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
</style>

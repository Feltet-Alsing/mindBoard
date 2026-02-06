<script lang="ts">
	import Pin from './Pin.svelte';

	type Pin = {
		position: {
			left: string;
			top: string;
		};
		height: string;
		width: string;
	};

	let pins: Pin[] = $state([]);

	function handleBoardClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		createPin(x.toString(), y.toString());
	}

	function createPin(x: string, y: string) {
		const pin: Pin = {
			position: { left: x, top: y },
			height: '40px',
			width: '40px'
		};

		pins.push(pin);
	}
</script>

<div
	class="container"
	onclick={handleBoardClick}
	onkeydown={(e) => e.key === 'Enter' && handleBoardClick(e as any)}
	role="button"
	tabindex="0"
	aria-label="Click to create a pin on the board"
>
	{#each pins as pin, i}
		<Pin bind:pin={pins[i]} />
	{/each}
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
</style>

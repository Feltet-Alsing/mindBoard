<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let {
		x,
		y,
		onConfirm,
		onCancel
	}: {
		x: number;
		y: number;
		onConfirm: (label: string, color: string) => void;
		onCancel: () => void;
	} = $props();

	let label = $state('');
	let selectedColor = $state('#00bcd4'); // Default aqua

	const colors = [
		{ name: 'Aqua', value: '#00bcd4' },
		{ name: 'Pink', value: '#ff69b4' },
		{ name: 'Yellow', value: '#ffd700' },
		{ name: 'Green', value: '#4caf50' },
		{ name: 'Orange', value: '#ff9800' },
		{ name: 'Purple', value: '#9c27b0' },
		{ name: 'Red', value: '#f44336' },
		{ name: 'Blue', value: '#2196f3' }
	];

	function handleConfirm() {
		onConfirm(label, selectedColor);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleConfirm();
		} else if (event.key === 'Escape') {
			onCancel();
		}
	}

	function handleContainerClick(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="menu-container"
	style="left: {x}px; top: {y}px;"
	transition:scale={{ duration: 150, start: 0.9 }}
	role="dialog"
	aria-label="Create pin menu"
	onclick={handleContainerClick}
>
	<div class="menu-header">
		<h3>Create Pin</h3>
	</div>

	<div class="menu-content">
		<div class="form-group">
			<label for="pin-label">Label (optional)</label>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				id="pin-label"
				type="text"
				bind:value={label}
				placeholder="Enter label..."
				class="label-input"
				onkeydown={handleKeydown}
				autofocus
			/>
		</div>

		<div class="form-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Color</label>
			<div class="color-grid">
				{#each colors as color}
					<button
						type="button"
						class="color-option"
						class:selected={selectedColor === color.value}
						style="background-color: {color.value};"
						onclick={() => (selectedColor = color.value)}
						title={color.name}
					>
						{#if selectedColor === color.value}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="menu-footer">
		<button class="confirm-btn" onclick={handleConfirm}>Create</button>
		<button class="cancel-btn" onclick={onCancel}>Cancel</button>
	</div>
</div>

<style>
	.menu-container {
		position: absolute;
		background: white;
		border-radius: 8px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		padding: 16px;
		min-width: 280px;
		z-index: 1000;
		transform: translate(-50%, -50%);
	}

	.menu-header {
		margin-bottom: 16px;
	}

	.menu-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #333;
	}

	.menu-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 600;
		color: #555;
	}

	.label-input {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 14px;
		color: #333;
		transition: border-color 0.2s;
	}

	.label-input:focus {
		outline: none;
		border-color: #00bcd4;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.color-option {
		width: 100%;
		aspect-ratio: 1;
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.color-option:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.color-option.selected {
		border-color: #333;
		transform: scale(1.05);
	}

	.checkmark {
		color: white;
		font-size: 20px;
		font-weight: bold;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.menu-footer {
		display: flex;
		gap: 8px;
		margin-top: 16px;
	}

	.confirm-btn,
	.cancel-btn {
		flex: 1;
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-btn {
		background-color: #00bcd4;
		color: white;
	}

	.confirm-btn:hover {
		background-color: #00acc1;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
	}

	.cancel-btn {
		background-color: #f5f5f5;
		color: #666;
	}

	.cancel-btn:hover {
		background-color: #e0e0e0;
		color: #333;
	}
</style>

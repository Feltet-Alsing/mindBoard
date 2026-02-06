<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	type PinType = {
		position: { left: string; top: string };
		height: string;
		width: string;
		title: string;
		content: string;
		color: string;
		label: string;
		connections: number[];
	};

	let {
		isOpen = $bindable(false),
		pin = $bindable(),
		pins = [],
		currentIndex = -1
	}: {
		isOpen: boolean;
		pin: PinType;
		pins?: PinType[];
		currentIndex?: number;
	} = $props();

	let localTitle = $state(pin?.title || '');
	let localContent = $state(pin?.content || '');
	let localLabel = $state(pin?.label || '');
	let localColor = $state(pin?.color || '#00bcd4');
	let showSettings = $state(false);

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

	// Update local state when modal opens
	$effect(() => {
		if (isOpen && pin) {
			localTitle = pin.title;
			localContent = pin.content;
			localLabel = pin.label;
			localColor = pin.color;
			showSettings = false;
		}
	});

	function closeModal() {
		isOpen = false;
	}

	function saveAndClose() {
		if (pin) {
			pin.title = localTitle;
			pin.content = localContent;
			pin.label = localLabel;
			pin.color = localColor;
		}
		closeModal();
	}

	function removeConnection(connIndex: number) {
		if (pin && currentIndex !== -1) {
			// Remove from this pin's connections
			pin.connections = pin.connections.filter((i) => i !== connIndex);
			// Remove from the other pin's connections
			if (pins && pins[connIndex]) {
				pins[connIndex].connections = pins[connIndex].connections.filter((i) => i !== currentIndex);
			}
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		if (event.target === event.currentTarget) {
			saveAndClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="backdrop"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 200 }}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Escape') closeModal();
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (e.target === e.currentTarget) saveAndClose();
			}
		}}
		aria-label="Close modal"
	>
		<div class="modal notebook-page" transition:scale={{ duration: 200, start: 0.95 }}>
			<div class="notebook-header">
				<button
					class="settings-toggle-btn"
					onclick={() => (showSettings = !showSettings)}
					title="{showSettings ? 'Hide' : 'Show'} pin settings"
					aria-label="Toggle pin settings"
				>
					⚙️
				</button>
				<button class="close-btn" onclick={saveAndClose} aria-label="Close">×</button>
			</div>

			<!-- Pin Settings Section -->
			{#if showSettings}
				<div class="pin-settings" transition:scale={{ duration: 200, start: 0.95 }}>
					<h3>Pin Settings</h3>
					<div class="settings-row">
						<div class="setting-group">
							<label for="pin-label-input">Label</label>
							<input
								id="pin-label-input"
								type="text"
								bind:value={localLabel}
								placeholder="Pin label..."
								class="settings-input"
							/>
						</div>
						<div class="setting-group">
							<label>Color</label>
							<div class="color-grid-small">
								{#each colors as color}
									<button
										type="button"
										class="color-option-small"
										class:selected={localColor === color.value}
										style="background-color: {color.value};"
										onclick={() => (localColor = color.value)}
										title={color.name}
									>
										{#if localColor === color.value}
											<span class="checkmark-small">✓</span>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					</div>

					{#if pins && pin.connections.length > 0}
						<div class="setting-group">
							<label>Connections ({pin.connections.length})</label>
							<div class="connections-list">
								{#each pin.connections as connIndex}
									{#if pins[connIndex]}
										<div class="connection-item">
											<div
												class="connection-pin"
												style="background-color: {pins[connIndex].color};"
											></div>
											<span class="connection-label">
												{pins[connIndex].label || 'Unlabeled pin'}
											</span>
											<button
												class="remove-connection-btn"
												onclick={() => removeConnection(connIndex)}
												title="Remove connection"
											>
												×
											</button>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<div class="notebook-content">
				<input
					id="title"
					type="text"
					bind:value={localTitle}
					placeholder="Untitled Note"
					class="notebook-title"
				/>
				<div class="notebook-lines">
					<textarea
						id="content"
						bind:value={localContent}
						placeholder="Start writing your note..."
						class="notebook-textarea"
					></textarea>
				</div>
			</div>
			<div class="notebook-footer">
				<button class="save-btn" onclick={saveAndClose}>Save & Close</button>
				<button class="cancel-btn" onclick={closeModal}>Discard</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		min-width: 400px;
		max-width: 600px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		width: 90vw;
		max-width: 1000px;
		height: 85vh;
		max-height: 800px;
	}

	.notebook-page {
		background: linear-gradient(to right, #f8f8f8 0%, #fff 50px, #fff 100%);
		border-left: 50px solid #f8f8f8;
		border-radius: 8px;
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		position: relative;
		overflow: hidden;
	}

	.notebook-page::before {
		content: '';
		position: absolute;
		left: 40px;
		top: 0;
		bottom: 0;
		width: 2px;
		background: linear-gradient(to bottom, #ff6b6b 0%, #ff6b6b 100%);
		opacity: 0.3;
	}

	.notebook-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		background: transparent;
	}

	.settings-toggle-btn {
		background: transparent;
		border: none;
		font-size: 24px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.2s;
		opacity: 0.6;
	}

	.settings-toggle-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		opacity: 1;
		transform: scale(1.1);
	}

	.pin-settings {
		padding: 0 60px 24px 60px;
		border-bottom: 2px solid #e0e0e0;
		margin-bottom: 16px;
	}

	.pin-settings h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		color: #333;
	}

	.settings-row {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 20px;
		margin-bottom: 16px;
	}

	.setting-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.setting-group label {
		font-size: 13px;
		font-weight: 600;
		color: #555;
	}

	.settings-input {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 14px;
		color: #333;
	}

	.settings-input:focus {
		outline: none;
		border-color: #00bcd4;
	}

	.color-grid-small {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 6px;
	}

	.color-option-small {
		width: 100%;
		aspect-ratio: 1;
		border: 2px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.color-option-small:hover {
		transform: scale(1.1);
	}

	.color-option-small.selected {
		border-color: #333;
		transform: scale(1.05);
	}

	.checkmark-small {
		color: white;
		font-size: 14px;
		font-weight: bold;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.connections-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.connection-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: #f5f5f5;
		border-radius: 6px;
	}

	.connection-pin {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid #333;
	}

	.connection-label {
		flex: 1;
		font-size: 14px;
		color: #555;
	}

	.remove-connection-btn {
		background: #ff6b6b;
		color: white;
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-connection-btn:hover {
		background: #ff5252;
		transform: scale(1.1);
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.05);
		border: none;
		font-size: 28px;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
		line-height: 1;
	}

	.close-btn:hover {
		background-color: rgba(0, 0, 0, 0.1);
		color: #333;
		transform: rotate(90deg);
	}

	.notebook-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 60px 24px 60px;
		overflow-y: auto;
	}

	.notebook-title {
		font-size: 32px;
		font-weight: 600;
		border: none;
		background: transparent;
		color: #1a1a1a;
		padding: 16px 0;
		margin-bottom: 24px;
		font-family: 'Georgia', serif;
		border-bottom: 2px solid #e0e0e0;
	}

	.notebook-title::placeholder {
		color: #ccc;
	}

	.notebook-title:focus {
		outline: none;
		border-bottom-color: #999;
	}

	.notebook-lines {
		flex: 1;
		position: relative;
		background: repeating-linear-gradient(
			transparent,
			transparent 31px,
			#e8e8e8 31px,
			#e8e8e8 32px
		);
		min-height: 400px;
	}

	.notebook-textarea {
		width: 100%;
		height: 100%;
		min-height: 400px;
		border: none;
		background: transparent;
		resize: none;
		font-size: 16px;
		line-height: 32px;
		color: #333;
		font-family: 'Georgia', serif;
		padding: 0;
	}

	.notebook-textarea::placeholder {
		color: #bbb;
		font-style: italic;
	}

	.notebook-textarea:focus {
		outline: none;
	}

	.notebook-footer {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding: 20px 60px;
		border-top: 1px solid #e0e0e0;
		background: rgba(248, 248, 248, 0.5);
	}

	.save-btn,
	.cancel-btn {
		padding: 12px 28px;
		border: none;
		border-radius: 6px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-btn {
		background-color: #2c3e50;
		color: white;
	}

	.save-btn:hover {
		background-color: #34495e;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(44, 62, 80, 0.3);
	}

	.cancel-btn {
		background-color: transparent;
		color: #7f8c8d;
		border: 1px solid #ddd;
	}

	.cancel-btn:hover {
		background-color: #f5f5f5;
		color: #555;
		border-color: #bbb;
	}
</style>

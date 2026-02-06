<script>
	import { createNote } from '$lib/db/notes.remote';

	let isCreating = false;
</script>

{#if isCreating}
	<div class="note-card create-note-expanded">
		<form {...createNote} on:submit={() => (isCreating = false)}>
			<input
				{...createNote.fields.title.as('text')}
				placeholder="Note title"
				class="title-input"
				autofocus
			/>
			{#each createNote.fields.title.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}

			<textarea
				{...createNote.fields.content.as('text')}
				placeholder="Write your note..."
				class="content-input"
			></textarea>
			{#each createNote.fields.content.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}

			<div class="button-group">
				<button type="submit" class="create-btn">Create</button>
				<button type="button" class="cancel-btn" on:click={() => (isCreating = false)}
					>Cancel</button
				>
			</div>
		</form>
	</div>
{:else}
	<button class="note-card create-note-empty" on:click={() => (isCreating = true)}>
		<div class="plus-icon">+</div>
		<span class="create-text">Create new note</span>
	</button>
{/if}

<style>
	.note-card {
		background: var(--light-grey);
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
		transition: all 0.2s;
		border: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
	}

	.create-note-empty {
		cursor: pointer;
		border: 2px dashed var(--border-color);
		background: transparent;
		color: var(--medium-grey);
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.create-note-empty:hover {
		border-color: var(--medium-grey);
		color: var(--dark-grey);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		background: var(--light-grey);
	}

	.plus-icon {
		font-size: 32px;
		font-weight: 300;
		line-height: 1;
		color: var(--medium-grey);
	}

	.create-note-empty:hover .plus-icon {
		color: var(--dark-grey);
	}

	.create-text {
		font-size: 14px;
		font-weight: 500;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		height: 100%;
	}

	.title-input {
		font-size: 18px;
		font-weight: 600;
		border: none;
		background: transparent;
		color: var(--dark-grey);
		padding: 0;
		outline: none;
		margin-bottom: 12px;
	}

	.title-input::placeholder {
		color: #aaa;
		font-weight: 600;
	}

	.content-input {
		font-size: 14px;
		border: none;
		background: transparent;
		color: var(--medium-grey);
		padding: 0;
		outline: none;
		resize: none;
		flex: 1;
		font-family: inherit;
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.content-input::placeholder {
		color: #aaa;
	}

	.error {
		color: var(--error-red);
		font-size: 13px;
		margin: -8px 0;
	}

	.button-group {
		display: flex;
		gap: 8px;
		margin-top: auto;
	}

	.create-btn,
	.cancel-btn {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.create-btn {
		background: var(--dark-grey);
		color: white;
	}

	.create-btn:hover {
		background: var(--medium-grey);
	}

	.cancel-btn {
		background: transparent;
		color: var(--medium-grey);
		border: 1px solid var(--border-color);
	}

	.cancel-btn:hover {
		background: white;
		color: var(--dark-grey);
	}
</style>

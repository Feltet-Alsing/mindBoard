<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deleteNote, getNote, updateNote } from '$lib/db/notes.remote';
	import { onMount } from 'svelte';

	let id = $state('');
	let isEditing = $state(false);

	onMount(() => {
		if (page.params.ID) {
			id = page.params.ID;
		}
	});

	function removeNote() {
		deleteNote(id);
		goto('../');
	}

	function toggleEdit() {
		isEditing = !isEditing;
	}
</script>

<div class="page-wrapper">
	{#if page.params.ID}
		{#await getNote(page.params.ID) then note}
			<div class="note-header">
				<a href="/main" class="back-link">← Back to Notes</a>
			</div>

			<div class="note-detail-card">
				{#if isEditing}
					<form
						{...updateNote.enhance(async ({ form, data, submit }) => {
							await submit();

							isEditing = false;
						})}
					>
						<input type="hidden" name="noteId" value={note.notes_id} />

						<div class="note-header-content">
							<div class="flex-box">
								<div class="edit-title-wrapper">
									<label for="title">Title</label>
									<input
										{...updateNote.fields.title.as('text')}
										value={note.title}
										class="edit-title-input"
									/>
									{#each updateNote.fields.title.issues() as issue}
										<p class="error">{issue.message}</p>
									{/each}
								</div>
								<div class="button-group">
									<button type="submit" class="save-btn">Save</button>
									<button type="button" class="cancel-btn" onclick={toggleEdit}>Cancel</button>
									<button type="button" class="delete" onclick={() => removeNote()}>Delete</button>
								</div>
							</div>
							<span class="note-meta">
								Created: {new Date(note.created_at).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</span>
						</div>

						<div class="note-content">
							<label for="content">Content</label>
							<textarea {...updateNote.fields.content.as('text')} class="edit-content-textarea"
								>{note.content}</textarea
							>
							{#each updateNote.fields.content.issues() as issue}
								<p class="error">{issue.message}</p>
							{/each}
						</div>

						{#if note.expires_at}
							<div class="note-footer">
								<span class="expires-info">
									Expires: {new Date(note.expires_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</span>
							</div>
						{/if}
					</form>
				{:else}
					<div class="note-header-content">
						<div class="flex-box">
							<h1>{note.title}</h1>
							<div class="button-group">
								<button class="edit-btn" onclick={toggleEdit}>Edit</button>
								<button class="delete" onclick={() => removeNote()}>Delete</button>
							</div>
						</div>
						<span class="note-meta">
							Created: {new Date(note.created_at).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</span>
					</div>

					<div class="note-content">
						<p>{note.content}</p>
					</div>

					{#if note.expires_at}
						<div class="note-footer">
							<span class="expires-info">
								Expires: {new Date(note.expires_at).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</span>
						</div>
					{/if}
				{/if}
			</div>
		{/await}
	{/if}
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		padding: 20px;
		max-width: 900px;
		margin: 0 auto;
	}

	.note-header {
		margin-bottom: 24px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		color: var(--dark-grey);
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		padding: 8px 16px;
		background: var(--light-grey);
		border-radius: 6px;
		border: 1px solid var(--border-color);
		transition: all 0.2s;
	}

	.back-link:hover {
		background: white;
		transform: translateX(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.note-detail-card {
		background: var(--light-grey);
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--border-color);
	}

	.note-header-content {
		border-bottom: 2px solid var(--border-color);
		padding-bottom: 24px;
		margin-bottom: 32px;
	}

	h1 {
		color: var(--dark-grey);
		font-size: 32px;
		font-weight: 600;
		margin-bottom: 12px;
		line-height: 1.2;
	}

	.note-meta {
		color: var(--medium-grey);
		font-size: 14px;
		font-style: italic;
	}

	.note-content {
		color: var(--dark-grey);
		font-size: 16px;
		line-height: 1.8;
		margin-bottom: 32px;
	}

	.note-content p {
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.note-footer {
		border-top: 1px solid var(--border-color);
		padding-top: 20px;
		display: flex;
		justify-content: flex-end;
	}

	.expires-info {
		color: var(--medium-grey);
		font-size: 13px;
		padding: 6px 12px;
		background: rgba(0, 0, 0, 0.03);
		border-radius: 6px;
	}

	.flex-box {
		display: flex;
		gap: 20px;
		justify-content: space-between;
		align-items: flex-start;
	}

	.button-group {
		display: flex;
		gap: 12px;
		flex-shrink: 0;
	}

	.edit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 20px;
		background: var(--dark-grey);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		line-height: 1;
	}

	.edit-btn:hover {
		background: var(--medium-grey);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.edit-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.save-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 20px;
		background: linear-gradient(135deg, #8aa888 0%, #7d9d7a 100%);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(125, 157, 122, 0.2);
		line-height: 1;
	}

	.save-btn:hover {
		background: linear-gradient(135deg, #7a9a78 0%, #6d8d6a 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(125, 157, 122, 0.3);
	}

	.save-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(125, 157, 122, 0.2);
	}

	.cancel-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 20px;
		background: white;
		color: var(--dark-grey);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		line-height: 1;
	}

	.cancel-btn:hover {
		background: var(--light-grey);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.cancel-btn:active {
		transform: translateY(0);
	}

	.delete {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 20px;
		background: linear-gradient(135deg, #d17167 0%, #c97064 100%);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(201, 112, 100, 0.2);
		flex-shrink: 0;
		line-height: 1;
	}

	.delete:hover {
		background: linear-gradient(135deg, #c16157 0%, #b96054 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(201, 112, 100, 0.3);
	}

	.delete:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(201, 112, 100, 0.2);
	}

	/* Edit mode styles */
	.edit-title-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.edit-title-wrapper label,
	.note-content label {
		color: var(--dark-grey);
		font-size: 14px;
		font-weight: 500;
	}

	.edit-title-input {
		padding: 12px 16px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 24px;
		font-weight: 600;
		background: white;
		color: var(--dark-grey);
		transition: all 0.2s;
		font-family: inherit;
	}

	.edit-title-input:focus {
		outline: none;
		border-color: var(--medium-grey);
		box-shadow: 0 0 0 3px rgba(106, 106, 106, 0.1);
	}

	.edit-content-textarea {
		width: 100%;
		min-height: 300px;
		padding: 12px 16px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 16px;
		background: white;
		color: var(--dark-grey);
		transition: all 0.2s;
		font-family: inherit;
		line-height: 1.8;
		resize: vertical;
		margin-top: 8px;
	}

	.edit-content-textarea:focus {
		outline: none;
		border-color: var(--medium-grey);
		box-shadow: 0 0 0 3px rgba(106, 106, 106, 0.1);
	}

	.error {
		color: var(--error-red);
		font-size: 13px;
		margin-top: 4px;
	}

	form {
		width: 100%;
	}

	@media (max-width: 640px) {
		.note-detail-card {
			padding: 24px;
		}

		h1 {
			font-size: 24px;
		}

		.note-content {
			font-size: 15px;
		}
		.flex-box {
			display: flex;
			gap: 20px;
			justify-content: space-between;
			align-items: flex-start;
			flex-direction: column;
			margin-bottom: 12px;
		}
	}
</style>

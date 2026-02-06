<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import MindBoard from '$lib/components/MindBoard.svelte';

	let { data } = $props();
</script>

<div class="page-wrapper">
	<div class="header-card">
		<div class="header-content">
			<div class="user-info">
				<h1>Welcome, {page.data.user?.username}!</h1>
				<p class="subtitle">Manage your notes</p>
			</div>
			<form method="POST" action="?/logout" use:enhance>
				<button class="logout-btn" type="submit">Logout</button>
			</form>
		</div>
	</div>
	<MindBoard initialPins={data.pins || []} />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	a {
		text-decoration: none;
	}

	.header-card {
		background: var(--light-grey);
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		margin-bottom: 30px;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
	}

	.user-info h1 {
		color: var(--dark-grey);
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.subtitle {
		color: var(--medium-grey);
		font-size: 14px;
	}

	.logout-btn {
		padding: 10px 24px;
		background: white;
		color: var(--dark-grey);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.logout-btn:hover {
		background: var(--dark-grey);
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.notes-section h2 {
		color: var(--dark-grey);
		font-size: 22px;
		font-weight: 600;
		margin-bottom: 20px;
	}

	.notes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	.note-card {
		background: var(--light-grey);
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
		transition: all 0.2s;
		border: 1px solid var(--border-color);
	}

	.note-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.note-card h3 {
		color: var(--dark-grey);
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.note-content {
		color: var(--medium-grey);
		font-size: 14px;
		line-height: 1.6;
		margin-bottom: 16px;
		word-wrap: break-word;
	}

	.note-date {
		color: var(--medium-grey);
		font-size: 12px;
		font-style: italic;
	}
</style>

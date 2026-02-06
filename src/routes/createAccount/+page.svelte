<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
</script>

<div class="container">
	<div class="card">
		<h1>Create Account</h1>
		<br />

		{#if page.form?.error}
			<div class="error-message">
				{page.form.error}
			</div>
		{/if}

		<form use:enhance method="POST" action="?/createUser">
			<label>
				<span>Username</span>
				<input name="username" type="text" placeholder="Enter username" required />
			</label>
			<label>
				<span>Password</span>
				<input name="password" type="password" placeholder="Enter password" required />
			</label>

			<button type="submit">Create Account</button>
		</form>

		<div class="footer-link">
			Already have an account? <a href="/">Sign in</a>
		</div>
	</div>
</div>

<style>
	.container {
		width: 100%;
		max-width: 420px;
		padding: 20px;
		margin: auto;
		margin-top: 50px;
	}

	.card {
		background: var(--light-grey);
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	h1 {
		color: var(--dark-grey);
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 8px;
		text-align: center;
	}

	.subtitle {
		color: var(--medium-grey);
		font-size: 14px;
		text-align: center;
		margin-bottom: 32px;
	}

	.error-message {
		background: rgba(201, 112, 100, 0.1);
		color: var(--error-red);
		padding: 12px 16px;
		border-radius: 6px;
		border: 1px solid var(--error-red);
		margin-bottom: 20px;
		font-size: 14px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label span {
		color: var(--dark-grey);
		font-size: 14px;
		font-weight: 500;
	}

	input {
		padding: 12px 16px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 15px;
		background: white;
		color: var(--dark-grey);
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--medium-grey);
		box-shadow: 0 0 0 3px rgba(106, 106, 106, 0.1);
	}

	input::placeholder {
		color: #aaa;
	}

	button {
		padding: 14px;
		background: var(--dark-grey);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 8px;
	}

	button:hover {
		background: var(--medium-grey);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	button:active {
		transform: translateY(0);
	}

	.footer-link {
		text-align: center;
		margin-top: 24px;
		color: var(--medium-grey);
		font-size: 14px;
	}

	.footer-link a {
		color: var(--dark-grey);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.footer-link a:hover {
		opacity: 0.7;
	}
</style>

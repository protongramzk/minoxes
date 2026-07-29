<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db.js';
	import { Save, X } from '@lucide/svelte';

	/** @type {number | null} */
	let docId = $state(null);

	let title = $state('Untitled Note');
	let content = $state('');
	let statusMsg = $state('');
	let errorMsg = $state('');

	onMount(async () => {
		const editId = $page.url.searchParams.get('edit');
		if (editId) {
			docId = parseInt(editId);
			const existingDoc = await db.documents.get(docId);
			if (existingDoc) {
				title = existingDoc.name.replace(/\.md$/, '');
				// Read blob content as text
				const text = await existingDoc.blob.text();
				content = text;
			} else {
				errorMsg = 'Document not found for editing.';
			}
		}
	});

	async function handleSave() {
		errorMsg = '';
		statusMsg = '';

		if (!title.trim()) {
			errorMsg = 'Title cannot be empty.';
			return;
		}

		// Ensure title has .md extension
		const filename = title.trim().endsWith('.md') ? title.trim() : `${title.trim()}.md`;
		const blob = new Blob([content], { type: 'text/markdown' });

		const docData = {
			name: filename,
			type: 'md',
			size: blob.size,
			date: new Date().toISOString(),
			blob: blob
		};

		try {
			if (docId) {
				// Update existing
				await db.documents.update(docId, docData);
				statusMsg = 'Document updated successfully!';
			} else {
				// Create new
				await db.documents.add(docData);
				statusMsg = 'Document created successfully!';
			}

			setTimeout(() => {
				goto('/');
			}, 1000);
		} catch (err) {
			console.error(err);
			const errMsg = err instanceof Error ? err.message : String(err);
			errorMsg = 'Error saving document: ' + errMsg;
		}
	}

	function handleCancel() {
		goto('/');
	}
</script>

<header class="cm-thumb-header">
	<h1 class="cm-header-title">{docId ? 'EDIT NOTE' : 'NEW NOTE'}</h1>
	<p class="cm-header-subtitle">Draft your notes using plain Markdown syntax.</p>
</header>

<div class="cm-container">
	<div class="writer-wrapper">
		<!-- Alerts -->
		{#if errorMsg}
			<div class="alert alert-danger">{errorMsg}</div>
		{/if}
		{#if statusMsg}
			<div class="alert alert-success">{statusMsg}</div>
		{/if}

		<div class="form-group">
			<label for="title-input" class="form-label">Note Title</label>
			<input
				id="title-input"
				type="text"
				placeholder="Enter title (e.g. My Shopping List)"
				class="cm-input"
				bind:value={title}
			/>
		</div>

		<div class="form-group flex-fill">
			<label for="content-input" class="form-label">Markdown Content</label>
			<textarea
				id="content-input"
				placeholder="# Hello World&#10;Write your markdown here..."
				class="cm-input textarea-content"
				bind:value={content}
			></textarea>
		</div>

		<!-- Action Bar adhering to cm-thumb-action-bar at the bottom (Lucide icons, no emojis) -->
		<div class="cm-thumb-action-bar">
			<button class="cm-btn btn-cancel" onclick={handleCancel}>
				<X size={16} class="btn-icon" /> Cancel
			</button>
			<button class="cm-btn cm-btn-primary" onclick={handleSave}>
				<Save size={16} class="btn-icon" /> Save Note
			</button>
		</div>
	</div>
</div>

<style>
	.writer-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.form-label {
		font-weight: 700;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.textarea-content {
		height: 350px;
		padding: var(--space-3);
		line-height: 1.6;
		resize: vertical;
		font-family: monospace;
	}

	.alert {
		padding: var(--space-3);
		border: 1px solid var(--cm-border);
		font-weight: 600;
	}

	.alert-danger {
		background-color: #ffebee;
		color: #c62828;
	}

	.alert-success {
		background-color: #e8f5e9;
		color: #2e7d32;
	}

	.btn-cancel {
		gap: 6px;
	}
	.btn-cancel:hover {
		background-color: var(--cm-bg-muted);
	}

	.cm-btn-primary {
		gap: 6px;
	}

	/* Push action bar over the bottom nav safely */
	.cm-thumb-action-bar {
		border-left: 1px solid var(--cm-border);
		border-right: 1px solid var(--cm-border);
		box-sizing: border-box;
	}
</style>

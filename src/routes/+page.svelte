<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/db.js';
	import { liveQuery } from 'dexie';
	import { Search, FileText, Trash2, Edit3, Sparkles, BookOpen, Image, FileCode, Table } from '@lucide/svelte';

	let searchQuery = $state('');

	// Fetch documents reactively using liveQuery
	/** @type {any[]} */
	let documents = $state([]);

	onMount(() => {
		const subscription = liveQuery(() =>
			db.documents.toArray()
		).subscribe({
			next: (docs) => {
				// Sort by date descending (newest first)
				documents = docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			},
			error: (err) => console.error(err)
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	// Filter documents by search query
	let filteredDocuments = $derived(
		documents.filter((doc) =>
			doc.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	/**
	 * Format file size for user readability
	 * @param {number} bytes
	 * @returns {string}
	 */
	function formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * Format date
	 * @param {string} dateStr
	 * @returns {string}
	 */
	function formatDate(dateStr) {
		const d = new Date(dateStr);
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Delete document from Dexie
	 * @param {number} id
	 */
	async function deleteDoc(id) {
		if (confirm('Are you sure you want to delete this document?')) {
			await db.documents.delete(id);
		}
	}

	/**
	 * Determine Lucide icon component based on file type
	 * @param {string} type
	 */
	function getDocIcon(type) {
		switch (type) {
			case 'md':
				return FileCode;
			case 'txt':
				return FileText;
			case 'pdf':
				return BookOpen;
			case 'docx':
				return FileText;
			case 'sheet':
				return Table;
			case 'image':
				return Image;
			default:
				return FileText;
		}
	}
</script>

<!-- Header -->
<header class="cm-thumb-header">
	<h1 class="cm-header-title">MINOXES</h1>
	<p class="cm-header-subtitle">Your offline-first, client-side document reader & writer.</p>
</header>

<div class="cm-container">
	<!-- Search Input -->
	<div class="search-container">
		<div class="search-box">
			<span class="search-icon-wrapper"><Search size={18} /></span>
			<input
				type="text"
				placeholder="Search documents..."
				class="cm-input search-input"
				bind:value={searchQuery}
			/>
		</div>
	</div>

	<!-- Document Stack -->
	{#if filteredDocuments.length === 0}
		<div class="cm-center empty-state">
			<span class="empty-icon-wrapper"><Sparkles size={48} /></span>
			<p class="empty-title">No documents found</p>
			<p class="empty-subtitle">Upload files or write notes to get started!</p>
			<div class="empty-actions">
				<a href="/upload" class="cm-btn cm-btn-primary">Upload File</a>
				<a href="/writer" class="cm-btn">Write Note</a>
			</div>
		</div>
	{:else}
		<div class="cm-stack document-list">
			{#each filteredDocuments as doc (doc.id)}
				{@const IconComp = getDocIcon(doc.type)}
				<div class="document-card">
					<div class="doc-info">
						<span class="doc-icon">
							<IconComp size={28} />
						</span>
						<div class="doc-meta">
							<span class="doc-name">{doc.name}</span>
							<span class="doc-details">
								{formatBytes(doc.size)} • {formatDate(doc.date)}
							</span>
						</div>
					</div>
					<div class="doc-actions">
						<a href="/reader/{doc.id}" class="cm-btn cm-btn-primary action-btn">
							<BookOpen size={16} class="btn-icon" /> Open
						</a>
						{#if doc.type === 'md'}
							<a href="/writer?edit={doc.id}" class="cm-btn action-btn">
								<Edit3 size={16} class="btn-icon" /> Edit
							</a>
						{/if}
						<button class="cm-btn action-btn btn-danger" onclick={() => deleteDoc(doc.id)}>
							<Trash2 size={16} class="btn-icon" /> Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-container {
		margin-bottom: var(--space-4);
		width: 100%;
	}

	.search-box {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	.search-icon-wrapper {
		position: absolute;
		left: 16px;
		display: flex;
		align-items: center;
		color: var(--cm-fg);
		opacity: 0.6;
		pointer-events: none;
	}

	.search-input {
		padding-left: 48px !important;
	}

	.empty-state {
		padding: var(--space-8) var(--space-4);
		text-align: center;
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius);
		background-color: var(--cm-bg-surface);
		box-shadow: var(--cm-shadow-sm);
		box-sizing: border-box;
	}

	.empty-icon-wrapper {
		display: inline-flex;
		align-items: center;
		margin-bottom: var(--space-3);
		color: var(--cm-fg);
		opacity: 0.8;
	}

	.empty-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 var(--space-1) 0;
	}

	.empty-subtitle {
		font-size: 0.95rem;
		opacity: 0.7;
		margin: 0 0 var(--space-4) 0;
	}

	.empty-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}

	.document-list {
		width: 100%;
		gap: var(--space-3);
	}

	.document-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius);
		background-color: var(--cm-bg-surface);
		box-shadow: var(--cm-shadow-sm);
		box-sizing: border-box;
		overflow: hidden;
		transition: transform var(--cm-speed) ease, box-shadow var(--cm-speed) ease;
	}

	.document-card:hover {
		box-shadow: var(--cm-shadow-md);
	}

	.doc-info {
		display: flex;
		align-items: center;
		padding: var(--space-4);
		gap: var(--space-3);
		min-width: 0;
	}

	.doc-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--cm-fg);
		padding: 10px;
		background-color: var(--cm-bg-muted);
		border-radius: var(--cm-radius-sm);
		flex-shrink: 0;
	}

	.doc-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.doc-name {
		font-weight: 700;
		font-size: 1.05rem;
		overflow-wrap: anywhere;
		word-break: break-word;
		line-height: 1.3;
	}

	.doc-details {
		font-size: 0.8rem;
		opacity: 0.7;
		margin-top: 4px;
	}

	.doc-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: var(--space-3) var(--space-4);
		background-color: var(--cm-bg-muted);
		border-top: 1px solid var(--cm-border);
		box-sizing: border-box;
	}

	.action-btn {
		min-height: 38px;
		padding: 0 12px;
		font-size: 0.85rem;
		border-radius: var(--cm-radius-sm);
		box-shadow: none;
		flex: 1;
		min-width: 80px;
		gap: 6px;
	}

	.btn-danger {
		background-color: transparent;
		color: #d32f2f;
		border: 1px solid rgba(211, 47, 47, 0.3);
	}

	.btn-danger:hover,
	.btn-danger:focus {
		background-color: #d32f2f;
		color: white;
		border-color: #d32f2f;
	}

	:global(.btn-icon) {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.document-card {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.doc-info {
			flex: 1;
		}

		.doc-actions {
			background-color: transparent;
			border-top: none;
			padding: var(--space-3) var(--space-4);
			flex-wrap: nowrap;
		}

		.action-btn {
			flex: none;
		}
	}
</style>

<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/db.js';
	import { liveQuery } from 'dexie';

	let searchQuery = $state('');
	let isScrolled = $state(false);

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

		const handleScroll = () => {
			if (window.scrollY > 40) {
				isScrolled = true;
			} else {
				isScrolled = false;
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			subscription.unsubscribe();
			window.removeEventListener('scroll', handleScroll);
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
	 * Determine emoji for file type
	 * @param {string} type
	 * @returns {string}
	 */
	function getDocEmoji(type) {
		switch (type) {
			case 'md':
				return '📝';
			case 'txt':
				return '📄';
			case 'pdf':
				return '📕';
			case 'docx':
				return '📘';
			case 'sheet':
				return '📊';
			case 'image':
				return '🖼️';
			default:
				return '📁';
		}
	}
</script>

<!-- Collapsible Thumb Friendly Header -->
<header class="cm-thumb-header" class:is-scrolled={isScrolled}>
	<h1 class="cm-header-title">MINOXES</h1>
	<p class="cm-header-subtitle">Your offline-first, client-side document reader & writer.</p>
</header>

<div class="cm-container">
	<!-- Search Input (Follows cm-bottom-search layout look but placed under header for standard list) -->
	<div class="search-container">
		<input
			type="text"
			placeholder="Search documents..."
			class="cm-input"
			bind:value={searchQuery}
		/>
	</div>

	<!-- Document Stack -->
	{#if filteredDocuments.length === 0}
		<div class="cm-center empty-state">
			<span class="empty-emoji">🏜️</span>
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
				<div class="document-card">
					<div class="doc-info">
						<span class="doc-icon">{getDocEmoji(doc.type)}</span>
						<div class="doc-meta">
							<span class="doc-name">{doc.name}</span>
							<span class="doc-details">
								{formatBytes(doc.size)} • {formatDate(doc.date)}
							</span>
						</div>
					</div>
					<div class="doc-actions">
						<a href="/reader/{doc.id}" class="cm-btn cm-btn-primary">Open</a>
						{#if doc.type === 'md'}
							<a href="/writer?edit={doc.id}" class="cm-btn">Edit</a>
						{/if}
						<button class="cm-btn btn-danger" onclick={() => deleteDoc(doc.id)}>Delete</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-container {
		margin-bottom: var(--space-4);
	}

	.empty-state {
		padding: var(--space-10) 0;
		text-align: center;
		border: 1px dashed var(--cm-border);
		background-color: var(--cm-bg-muted);
	}

	.empty-emoji {
		font-size: 3rem;
		margin-bottom: var(--space-2);
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
		background-color: var(--cm-bg);
		box-sizing: border-box;
	}

	.doc-info {
		display: flex;
		align-items: center;
		padding: var(--space-3);
		border-bottom: 1px solid var(--cm-border);
		gap: var(--space-3);
	}

	.doc-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.doc-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.doc-name {
		font-weight: 700;
		font-size: 1.1rem;
		word-break: break-all;
	}

	.doc-details {
		font-size: 0.8rem;
		opacity: 0.7;
		margin-top: var(--space-1);
	}

	.doc-actions {
		display: flex;
		width: 100%;
	}

	.doc-actions .cm-btn {
		flex: 1;
		border: none;
		border-right: 1px solid var(--cm-border);
	}

	.doc-actions .cm-btn:last-child {
		border-right: none;
	}

	.btn-danger:hover,
	.btn-danger:focus {
		background-color: #d32f2f;
		color: white;
	}

	@media (min-width: 600px) {
		.document-card {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.doc-info {
			border-bottom: none;
			flex: 1;
		}

		.doc-actions {
			width: auto;
			border-left: 1px solid var(--cm-border);
		}

		.doc-actions .cm-btn {
			flex: none;
			padding: 0 var(--space-4);
			border-top: none;
		}
	}
</style>

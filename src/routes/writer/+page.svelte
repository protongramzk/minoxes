<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db.js';
	import { Save, X, Bold, Italic, Heading1, Heading2, Code, Quote, List, ListOrdered } from '@lucide/svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Markdown } from '@tiptap/markdown';

	/** @type {number | null} */
	let docId = $state(null);

	let title = $state('Untitled Note');
	let content = $state('');
	let statusMsg = $state('');
	let errorMsg = $state('');

	/** @type {HTMLDivElement | undefined} */
	let editorElement = $state();
	/** @type {Editor | undefined} */
	let editor = $state();

	// Counter to trigger reactivity for toolbar buttons on transactions
	let selectionChanged = $state(0);

	onMount(() => {
		// Initialize Tiptap editor with StarterKit and Markdown extensions
		editor = new Editor({
			element: editorElement,
			extensions: [StarterKit, Markdown],
			content: content,
			contentType: 'markdown',
			onUpdate: ({ editor }) => {
				content = editor.getMarkdown();
			},
			onTransaction: () => {
				selectionChanged += 1;
			},
			editorProps: {
				attributes: {
					class: 'tiptap-editable-area'
				}
			}
		});

		// Synchronous invocation of async loader to avoid returning Promise to onMount
		const loadExistingDoc = async () => {
			const editId = $page.url.searchParams.get('edit');
			if (editId) {
				docId = parseInt(editId);
				const existingDoc = await db.documents.get(docId);
				if (existingDoc && editor) {
					title = existingDoc.name.replace(/\.md$/, '');
					const text = await existingDoc.blob.text();
					content = text;
					editor.commands.setContent(text, { contentType: 'markdown' });
				} else if (!existingDoc) {
					errorMsg = 'Document not found for editing.';
				}
			}
		};

		loadExistingDoc();

		return () => {
			if (editor) {
				editor.destroy();
			}
		};
	});

	/**
	 * Reactive helper to check if a format/command is active
	 * @param {string} name
	 * @param {any} [attrs]
	 * @returns {boolean}
	 */
	function isButtonActive(name, attrs = {}) {
		if (!editor) return false;
		// Reference selectionChanged to establish dependency
		const _ = selectionChanged;
		return editor.isActive(name, attrs);
	}

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
			<span class="form-label">Markdown Content</span>

			<div class="editor-container">
				<!-- Formatting Toolbar -->
				{#if editor}
					<div class="tiptap-toolbar">
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('bold')}
							onclick={() => editor?.chain().focus().toggleBold().run()}
							title="Bold"
						>
							<Bold size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('italic')}
							onclick={() => editor?.chain().focus().toggleItalic().run()}
							title="Italic"
						>
							<Italic size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('code')}
							onclick={() => editor?.chain().focus().toggleCode().run()}
							title="Inline Code"
						>
							<Code size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('heading', { level: 1 })}
							onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
							title="Heading 1"
						>
							<Heading1 size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('heading', { level: 2 })}
							onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
							title="Heading 2"
						>
							<Heading2 size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('bulletList')}
							onclick={() => editor?.chain().focus().toggleBulletList().run()}
							title="Bullet List"
						>
							<List size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('orderedList')}
							onclick={() => editor?.chain().focus().toggleOrderedList().run()}
							title="Numbered List"
						>
							<ListOrdered size={18} />
						</button>
						<button
							type="button"
							class="toolbar-btn"
							class:active={isButtonActive('blockquote')}
							onclick={() => editor?.chain().focus().toggleBlockquote().run()}
							title="Blockquote"
						>
							<Quote size={18} />
						</button>
					</div>
				{/if}

				<!-- Editor Content Area -->
				<div bind:this={editorElement} class="tiptap-editor-content"></div>
			</div>
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

	.editor-container {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--cm-border);
		background-color: var(--cm-bg);
		box-sizing: border-box;
	}

	.tiptap-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		padding: var(--space-2);
		background-color: var(--cm-bg-muted);
		border-bottom: 1px solid var(--cm-border);
	}

	.toolbar-btn {
		background: none;
		border: 1px solid transparent;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--cm-fg);
		box-sizing: border-box;
	}

	.toolbar-btn:hover {
		background-color: var(--cm-bg-muted);
		border-color: var(--cm-border);
	}

	.toolbar-btn.active {
		background-color: var(--cm-bg-inverse);
		color: var(--cm-fg-inverse);
		border-color: var(--cm-border);
	}

	.tiptap-editor-content {
		min-height: 350px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	/* Target ProseMirror elements inside tiptap */
	.tiptap-editor-content :global(.ProseMirror) {
		min-height: 350px;
		padding: var(--space-3);
		outline: none;
		font-family: monospace;
		line-height: 1.6;
		flex: 1;
		box-sizing: border-box;
	}

	.tiptap-editor-content :global(.ProseMirror p) {
		margin-top: 0;
		margin-bottom: var(--space-3);
	}

	.tiptap-editor-content :global(.ProseMirror h1),
	.tiptap-editor-content :global(.ProseMirror h2) {
		font-weight: 800;
		margin-top: var(--space-4);
		margin-bottom: var(--space-2);
	}

	.tiptap-editor-content :global(.ProseMirror ul),
	.tiptap-editor-content :global(.ProseMirror ol) {
		margin-top: 0;
		margin-bottom: var(--space-3);
		padding-left: var(--space-6);
	}

	.tiptap-editor-content :global(.ProseMirror blockquote) {
		border-left: 4px solid var(--cm-border);
		margin: var(--space-3) 0;
		padding-left: var(--space-3);
		font-style: italic;
		opacity: 0.9;
	}

	.tiptap-editor-content :global(.ProseMirror code) {
		font-family: monospace;
		background-color: var(--cm-bg-muted);
		padding: 2px 6px;
		font-size: 0.9em;
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

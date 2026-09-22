<script>
	import { goto } from '$app/navigation';
	import { saveDocument } from '$lib/db.js';
	import { UploadCloud, File as FileIcon, X } from '@lucide/svelte';

	let isDragging = $state(false);
	let errorMsg = $state('');
	let statusMsg = $state('');

	/** @type {File[]} */
	let filesToUpload = $state([]);

	/**
	 * @param {DragEvent} e
	 */
	function onDragOver(e) {
		e.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	/**
	 * @param {DragEvent} e
	 */
	async function onDrop(e) {
		e.preventDefault();
		isDragging = false;
		errorMsg = '';
		statusMsg = '';

		if (e.dataTransfer && e.dataTransfer.files) {
			const droppedFiles = Array.from(e.dataTransfer.files);
			if (droppedFiles.length > 0) {
				filesToUpload = [...filesToUpload, ...droppedFiles];
			}
		}
	}

	/**
	 * @param {Event & { currentTarget: HTMLInputElement }} e
	 */
	function onFileSelect(e) {
		errorMsg = '';
		statusMsg = '';
		if (e.currentTarget && e.currentTarget.files) {
			const selectedFiles = Array.from(e.currentTarget.files);
			if (selectedFiles.length > 0) {
				filesToUpload = [...filesToUpload, ...selectedFiles];
			}
		}
	}

	/**
	 * @param {number} index
	 */
	function removeFile(index) {
		filesToUpload = filesToUpload.filter((_, i) => i !== index);
	}

	async function handleUpload() {
		if (filesToUpload.length === 0) {
			errorMsg = 'Please select or drop at least one file first.';
			return;
		}

		statusMsg = 'Uploading files...';
		try {
			for (const file of filesToUpload) {
				await saveDocument(file);
			}
			statusMsg = 'Upload successful!';
			filesToUpload = [];
			setTimeout(() => {
				goto('/');
			}, 1000);
		} catch (err) {
			console.error(err);
			const errMsg = err instanceof Error ? err.message : String(err);
			errorMsg = 'Failed to save documents: ' + errMsg;
			statusMsg = '';
		}
	}
</script>

<header class="cm-thumb-header">
	<h1 class="cm-header-title">UPLOAD</h1>
	<p class="cm-header-subtitle">Import documents into your local client-side library.</p>
</header>

<div class="cm-container">
	<div class="upload-wrapper">
		<!-- Drag and Drop Zone -->
		<div
			class="dropzone"
			class:is-dragging={isDragging}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			ondrop={onDrop}
			role="none"
		>
			<span class="upload-icon"><UploadCloud size={48} /></span>
			<p class="drop-text">Drag and drop files here, or click to browse</p>
			<p class="format-info">Supports MD, TXT, PDF, DOCX, XLSX, CSV, and Images</p>

			<label class="cm-btn cm-btn-primary file-input-label">
				Choose Files
				<input
					type="file"
					multiple
					onchange={onFileSelect}
					class="hidden-file-input"
				/>
			</label>
		</div>

		<!-- Feedback Messages -->
		{#if errorMsg}
			<div class="alert alert-danger">{errorMsg}</div>
		{/if}
		{#if statusMsg}
			<div class="alert alert-success">{statusMsg}</div>
		{/if}

		<!-- File Queue List -->
		{#if filesToUpload.length > 0}
			<div class="queue-section">
				<h3 class="queue-title">Files to Upload ({filesToUpload.length})</h3>
				<div class="cm-stack queue-list">
					{#each filesToUpload as file, index}
						<div class="queue-item">
							<div class="queue-meta flex-row">
								<span class="file-icon-wrapper"><FileIcon size={18} /></span>
								<div class="queue-info">
									<span class="queue-name">{file.name}</span>
									<span class="queue-size">{(file.size / 1024).toFixed(1)} KB</span>
								</div>
							</div>
							<button class="cm-btn btn-remove" onclick={() => removeFile(index)}>
								<X size={14} />
							</button>
						</div>
					{/each}
				</div>

				<div class="upload-actions">
					<button class="cm-btn cm-btn-primary full-width" onclick={handleUpload}>
						Upload All Files
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.upload-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8) var(--space-4);
		border: 2px dashed var(--cm-border);
		border-radius: var(--cm-radius-lg);
		background-color: var(--cm-bg-surface);
		box-shadow: var(--cm-shadow-sm);
		text-align: center;
		cursor: pointer;
		transition: all var(--cm-speed) ease;
		box-sizing: border-box;
	}

	.dropzone:hover,
	.dropzone.is-dragging {
		background-color: var(--cm-bg-muted);
		border-color: var(--cm-fg);
		box-shadow: var(--cm-shadow-md);
	}

	.upload-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-2);
		color: var(--cm-fg);
		opacity: 0.8;
	}

	.drop-text {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0 0 var(--space-1) 0;
	}

	.format-info {
		font-size: 0.85rem;
		opacity: 0.7;
		margin: 0 0 var(--space-4) 0;
	}

	.file-input-label {
		cursor: pointer;
	}

	.hidden-file-input {
		display: none;
	}

	.alert {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--cm-radius);
		border: 1px solid var(--cm-border);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.alert-danger {
		background-color: rgba(211, 47, 47, 0.08);
		color: #d32f2f;
		border-color: rgba(211, 47, 47, 0.2);
	}

	.alert-success {
		background-color: rgba(46, 125, 50, 0.08);
		color: #2e7d32;
		border-color: rgba(46, 125, 50, 0.2);
	}

	.queue-section {
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius);
		background-color: var(--cm-bg-surface);
		box-shadow: var(--cm-shadow-sm);
		padding: var(--space-4);
		box-sizing: border-box;
	}

	.queue-title {
		margin: 0 0 var(--space-3) 0;
		font-size: 1.1rem;
		font-weight: 700;
		border-bottom: 1px solid var(--cm-border);
		padding-bottom: var(--space-2);
	}

	.queue-list {
		gap: var(--space-2);
		width: 100%;
	}

	.queue-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius-sm);
		background-color: var(--cm-bg-muted);
		padding: var(--space-2) var(--space-3);
		box-sizing: border-box;
		gap: var(--space-2);
	}

	.flex-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.file-icon-wrapper {
		display: inline-flex;
		align-items: center;
		color: var(--cm-fg);
		opacity: 0.8;
		flex-shrink: 0;
	}

	.queue-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.queue-name {
		font-weight: 600;
		overflow-wrap: anywhere;
		word-break: break-word;
		font-size: 0.9rem;
	}

	.queue-size {
		font-size: 0.78rem;
		opacity: 0.7;
	}

	.btn-remove {
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius-sm);
		min-height: auto;
		height: 32px;
		width: 32px;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: none;
	}

	.btn-remove:hover {
		background-color: #d32f2f;
		color: white;
		border-color: #d32f2f;
	}

	.upload-actions {
		margin-top: var(--space-4);
	}

	.full-width {
		width: 100%;
	}
</style>

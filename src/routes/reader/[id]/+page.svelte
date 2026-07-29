<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { db } from '$lib/db.js';
	import { theme, font, textScale } from '$lib/stores.js';
	import { marked } from 'marked';
	import mammoth from 'mammoth';
	import * as XLSX from 'xlsx';

	/** @type {number | null} */
	let docId = $state(null);

	/** @type {import('$lib/db.js').DocumentRecord | null} */
	let doc = $state(null);

	let errorMsg = $state('');
	let loading = $state(true);

	// Parser output states
	let htmlContent = $state('');

	/** @type {import('xlsx').WorkBook | null} */
	let workbook = $state(null);

	/** @type {string[]} */
	let sheetNames = $state([]);
	let activeSheet = $state('');
	let sheetHtml = $state('');

	// PDF specific states
	/** @type {any} */
	let pdfDoc = $state(null);
	let pdfNumPages = $state(0);
	let pdfCurrentPage = $state(1);

	/** @type {HTMLCanvasElement | null} */
	let pdfCanvas = $state(null);
	let pdfRendering = $state(false);

	// Image state
	let imageUrl = $state('');

	// Bottom Sheet Controller
	let showSettingsSheet = $state(false);

	async function loadDoc() {
		const idStr = $page.params.id || '';
		docId = parseInt(idStr);

		try {
			const fetched = await db.documents.get(docId);
			if (!fetched) {
				errorMsg = 'Document not found.';
				loading = false;
				return;
			}
			doc = fetched;

			// Process based on file type
			await parseDocument(doc);
		} catch (err) {
			console.error(err);
			const errMsg = err instanceof Error ? err.message : String(err);
			errorMsg = 'Error loading document: ' + errMsg;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDoc();

		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
		};
	});

	/**
	 * Parses and processes document blob based on document type
	 * @param {import('$lib/db.js').DocumentRecord} document
	 */
	async function parseDocument(document) {
		const blob = document.blob;
		const type = document.type;

		switch (type) {
			case 'md':
				const mdText = await blob.text();
				htmlContent = await marked.parse(mdText);
				break;

			case 'txt':
				const rawText = await blob.text();
				// Convert plain text newlines to html breaks
				htmlContent = rawText
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\n/g, '<br/>');
				break;

			case 'docx':
				const arrayBuffer = await blob.arrayBuffer();
				const result = await mammoth.convertToHtml({ arrayBuffer });
				htmlContent = result.value;
				break;

			case 'sheet':
				const sheetBuffer = await blob.arrayBuffer();
				const wb = XLSX.read(sheetBuffer, { type: 'array' });
				workbook = wb;
				sheetNames = wb.SheetNames;
				if (sheetNames.length > 0) {
					activeSheet = sheetNames[0];
					renderActiveSheet();
				}
				break;

			case 'image':
				imageUrl = URL.createObjectURL(blob);
				break;

			case 'pdf':
				await initPdf(blob);
				break;
		}
	}

	function renderActiveSheet() {
		if (!workbook || !activeSheet) return;
		const ws = workbook.Sheets[activeSheet];
		// Convert to HTML table with xlsx utility
		sheetHtml = XLSX.utils.sheet_to_html(ws);
	}

	/**
	 * Switches the active Excel sheet tab
	 * @param {string} name
	 */
	function handleSheetChange(name) {
		activeSheet = name;
		renderActiveSheet();
	}

	/**
	 * PDF.js Integration
	 * @param {Blob} blob
	 */
	async function initPdf(blob) {
		try {
			// Import pdfjs-dist dynamically in client-side
			const pdfjs = await import('pdfjs-dist');

			// Setup worker
			const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
			pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

			const arrayBuffer = await blob.arrayBuffer();
			const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
			const loadedPdf = await loadingTask.promise;
			pdfDoc = loadedPdf;
			pdfNumPages = loadedPdf.numPages;
			pdfCurrentPage = 1;

			await tick();
			await renderPdfPage(pdfCurrentPage);
		} catch (err) {
			console.error('PDF Init Error:', err);
			const errMsg = err instanceof Error ? err.message : String(err);
			errorMsg = 'Error initializing PDF renderer: ' + errMsg;
		}
	}

	/**
	 * Renders a specific page of the active PDF
	 * @param {number} num
	 */
	async function renderPdfPage(num) {
		if (!pdfDoc || !pdfCanvas || pdfRendering) return;
		pdfRendering = true;

		try {
			const pageInstance = await pdfDoc.getPage(num);
			const ctx = pdfCanvas.getContext('2d');
			if (!ctx) return;

			// Get standard viewport scale
			const viewport = pageInstance.getViewport({ scale: 1.5 });
			pdfCanvas.height = viewport.height;
			pdfCanvas.width = viewport.width;

			const renderContext = {
				canvasContext: ctx,
				viewport: viewport
			};

			await pageInstance.render(renderContext).promise;
		} catch (err) {
			console.error('PDF Page Render Error:', err);
		} finally {
			pdfRendering = false;
		}
	}

	async function prevPdfPage() {
		if (pdfCurrentPage <= 1 || pdfRendering) return;
		pdfCurrentPage--;
		await renderPdfPage(pdfCurrentPage);
	}

	async function nextPdfPage() {
		if (pdfCurrentPage >= pdfNumPages || pdfRendering) return;
		pdfCurrentPage++;
		await renderPdfPage(pdfCurrentPage);
	}

	/**
	 * Settings Theme selector
	 * @param {string} t
	 */
	function selectTheme(t) {
		theme.set(t);
	}

	/**
	 * Settings Font selector
	 * @param {string} f
	 */
	function selectFont(f) {
		font.set(f);
	}

	/**
	 * Alters Reader text scale
	 * @param {number} amount
	 */
	function changeScale(amount) {
		textScale.update((scale) => {
			const nextScale = parseFloat((scale + amount).toFixed(1));
			return Math.max(0.6, Math.min(2.5, nextScale));
		});
	}
</script>

<header class="cm-thumb-header is-scrolled">
	<div class="header-content">
		<a href="/" class="btn-back">⬅️</a>
		<h1 class="cm-header-title">{doc ? doc.name : 'Reader View'}</h1>
		<button class="btn-settings-toggle" onclick={() => showSettingsSheet = true}>⚙️</button>
	</div>
</header>

<div class="cm-container reader-container">
	{#if loading}
		<div class="cm-center loading-state">
			<span class="loading-spinner">⌛</span>
			<p>Parsing document content, please wait...</p>
		</div>
	{:else if errorMsg}
		<div class="cm-center error-state">
			<span class="error-icon">⚠️</span>
			<p class="error-title">Unable to Read Document</p>
			<p class="error-subtitle">{errorMsg}</p>
			<a href="/" class="cm-btn cm-btn-primary">Back to Library</a>
		</div>
	{:else if doc}
		<article class="cm-prose cm-reader-content">
			<!-- Markdown / Plain Text / Word DOCX rendering -->
			{#if ['md', 'txt', 'docx'].includes(doc.type)}
				<div class="prose-body">
					{@html htmlContent}
				</div>

			<!-- Spreadsheet (XLSX / CSV) rendering -->
			{:else if doc.type === 'sheet'}
				<div class="sheet-tabs cm-scroll-x">
					{#each sheetNames as name}
						<button
							class="cm-btn tab-btn"
							class:active-tab={activeSheet === name}
							onclick={() => handleSheetChange(name)}
						>
							{name}
						</button>
					{/each}
				</div>
				<div class="sheet-table-wrapper cm-scroll-x">
					<!-- Bind sheet styling to unified CSS variables -->
					<div class="sheet-html-container">
						{@html sheetHtml}
					</div>
				</div>

			<!-- Image rendering -->
			{:else if doc.type === 'image'}
				<div class="image-viewer-wrapper">
					<img src={imageUrl} alt={doc.name} class="native-image" />
				</div>

			<!-- PDF rendering -->
			{:else if doc.type === 'pdf'}
				<div class="pdf-viewer-wrapper">
					<div class="pdf-controls">
						<button class="cm-btn" onclick={prevPdfPage} disabled={pdfCurrentPage <= 1 || pdfRendering}>
							◀ Prev
						</button>
						<span class="page-num">Page {pdfCurrentPage} of {pdfNumPages}</span>
						<button class="cm-btn" onclick={nextPdfPage} disabled={pdfCurrentPage >= pdfNumPages || pdfRendering}>
							Next ▶
						</button>
					</div>
					<div class="pdf-canvas-container">
						<canvas bind:this={pdfCanvas} class="pdf-canvas"></canvas>
					</div>
				</div>
			{/if}
		</article>
	{/if}
</div>

<!-- Reader Config Bottom Sheet -->
{#if showSettingsSheet}
	<div class="cm-bottom-sheet-overlay" onclick={() => showSettingsSheet = false} role="none">
		<div class="cm-bottom-sheet" onclick={(e) => e.stopPropagation()} role="none">
			<div class="sheet-header">
				<h3 class="sheet-title">Reader Options</h3>
				<button class="btn-close-sheet" onclick={() => showSettingsSheet = false}>✕</button>
			</div>

			<!-- Theme Picker -->
			<div class="option-section">
				<span class="option-label">Reader Color Scheme</span>
				<div class="theme-grid">
					<button
						class="cm-btn theme-choice light-choice"
						class:active-choice={$theme === 'light'}
						onclick={() => selectTheme('light')}
					>
						Light
					</button>
					<button
						class="cm-btn theme-choice dark-choice"
						class:active-choice={$theme === 'dark'}
						onclick={() => selectTheme('dark')}
					>
						Dark (OLED)
					</button>
					<button
						class="cm-btn theme-choice sepia-choice"
						class:active-choice={$theme === 'sepia'}
						onclick={() => selectTheme('sepia')}
					>
						Sepia
					</button>
					<button
						class="cm-btn theme-choice nord-choice"
						class:active-choice={$theme === 'nord'}
						onclick={() => selectTheme('nord')}
					>
						Nord
					</button>
				</div>
			</div>

			<!-- Font Picker (Exclude PDF/Images) -->
			{#if doc && ['md', 'txt', 'docx', 'sheet'].includes(doc.type)}
				<div class="option-section">
					<span class="option-label">Reader Font Family</span>
					<div class="font-grid">
						<button
							class="cm-btn font-choice"
							style="font-family: 'Inter';"
							class:active-choice={$font === 'inter'}
							onclick={() => selectFont('inter')}
						>
							Inter
						</button>
						<button
							class="cm-btn font-choice"
							style="font-family: 'Fira Sans';"
							class:active-choice={$font === 'fira'}
							onclick={() => selectFont('fira')}
						>
							Fira Sans
						</button>
						<button
							class="cm-btn font-choice"
							style="font-family: 'Space Grotesk';"
							class:active-choice={$font === 'space'}
							onclick={() => selectFont('space')}
						>
							Space Grotesk
						</button>
						<button
							class="cm-btn font-choice"
							style="font-family: 'Times New Roman';"
							class:active-choice={$font === 'times'}
							onclick={() => selectFont('times')}
						>
							Times New Roman
						</button>
						<button
							class="cm-btn font-choice"
							style="font-family: 'Lora';"
							class:active-choice={$font === 'lora'}
							onclick={() => selectFont('lora')}
						>
							Lora
						</button>
						<button
							class="cm-btn font-choice"
							style="font-family: 'Merriweather';"
							class:active-choice={$font === 'merriweather'}
							onclick={() => selectFont('merriweather')}
						>
							Merriweather
						</button>
					</div>
				</div>

				<!-- Text Scale Sizer -->
				<div class="option-section">
					<span class="option-label">Text Scale Level</span>
					<div class="scale-sizer">
						<button class="cm-btn" onclick={() => changeScale(-0.1)}>A-</button>
						<span class="scale-value">{Math.round($textScale * 100)}%</span>
						<button class="cm-btn" onclick={() => changeScale(0.1)}>A+</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: var(--space-3);
	}

	.btn-back,
	.btn-settings-toggle {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.5rem;
		padding: 0;
		color: var(--cm-fg);
	}

	.btn-back {
		text-decoration: none;
	}

	.reader-container {
		padding-top: var(--space-4);
	}

	.loading-state,
	.error-state {
		text-align: center;
		padding: var(--space-10) 0;
	}

	.loading-spinner {
		font-size: 3rem;
		display: inline-block;
		animation: spin 2s linear infinite;
	}

	.error-icon {
		font-size: 3rem;
		color: #d32f2f;
	}

	.error-title {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.error-subtitle {
		opacity: 0.7;
		margin-bottom: var(--space-4);
	}

	/* prose reading style following Breathing Text rules */
	.prose-body {
		font-size: calc(1rem * var(--cm-text-scale, 1.0));
		line-height: 1.65;
		max-width: 75ch; /* Humanist Typography limits characters per line */
		margin: 0 auto;
		word-wrap: break-word;
		/* Breathing Text padding using clamping scale */
		padding: clamp(16px, 2vw, 24px) clamp(16px, 3vw, 32px);
	}

	.prose-body :global(h1),
	.prose-body :global(h2),
	.prose-body :global(h3),
	.prose-body :global(h4) {
		font-weight: 800;
		line-height: 1.2;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	.prose-body :global(h1) { font-size: 2rem; }
	.prose-body :global(h2) { font-size: 1.6rem; }
	.prose-body :global(h3) { font-size: 1.3rem; }

	.prose-body :global(p) {
		margin-top: 0;
		margin-bottom: 1.25em;
	}

	.prose-body :global(code) {
		font-family: monospace;
		background-color: var(--cm-bg-muted);
		padding: 2px 6px;
		font-size: 0.9em;
	}

	.prose-body :global(pre) {
		background-color: var(--cm-bg-muted);
		padding: var(--space-3);
		overflow-x: auto;
		border: 1px solid var(--cm-border);
	}

	.prose-body :global(pre code) {
		background-color: transparent;
		padding: 0;
	}

	.prose-body :global(blockquote) {
		border-left: 4px solid var(--cm-border);
		margin: 1.5em 0;
		padding-left: var(--space-4);
		font-style: italic;
		opacity: 0.9;
	}

	/* Sheet styling obeying Unified Theme and overflow scroll */
	.sheet-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--cm-border);
		padding-bottom: var(--space-2);
	}

	.tab-btn {
		min-height: 36px;
		padding: 0 var(--space-3);
		font-size: 0.9rem;
	}

	.active-tab {
		background-color: var(--cm-bg-inverse);
		color: var(--cm-fg-inverse);
	}

	.sheet-table-wrapper {
		width: 100%;
		border: 1px solid var(--cm-border);
	}

	.sheet-html-container :global(table) {
		border-collapse: collapse;
		width: 100%;
		font-size: calc(0.9rem * var(--cm-text-scale, 1.0));
	}

	.sheet-html-container :global(th),
	.sheet-html-container :global(td) {
		border: 1px solid var(--cm-border);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		/* Obey active reader color scheme over hardcoded excel styles */
		background-color: var(--cm-bg) !important;
		color: var(--cm-fg) !important;
	}

	.sheet-html-container :global(th) {
		font-weight: 700;
		background-color: var(--cm-bg-muted) !important;
	}

	/* Native image viewer */
	.image-viewer-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--cm-border);
		background-color: var(--cm-bg-muted);
		padding: var(--space-4);
	}

	.native-image {
		max-width: 100%;
		height: auto;
		border: 1px solid var(--cm-border);
	}

	/* PDF viewer layout */
	.pdf-viewer-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.pdf-controls {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.page-num {
		font-weight: 700;
	}

	.pdf-canvas-container {
		width: 100%;
		max-width: 800px;
		border: 1px solid var(--cm-border);
		overflow: auto;
		background-color: var(--cm-bg-muted);
		display: flex;
		justify-content: center;
	}

	.pdf-canvas {
		max-width: 100%;
		height: auto;
	}

	/* Bottom sheet styles */
	.sheet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--cm-border);
		padding-bottom: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.sheet-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 800;
	}

	.btn-close-sheet {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: var(--cm-fg);
	}

	.option-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.option-label {
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.8;
	}

	.theme-grid,
	.font-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.theme-choice,
	.font-choice {
		font-size: 0.9rem;
		justify-content: center;
		min-height: 40px;
	}

	.light-choice { background-color: #ffffff; color: #111111; }
	.dark-choice { background-color: #111111; color: #eeeeee; }
	.sepia-choice { background-color: #f4ecd8; color: #5b4636; }
	.nord-choice { background-color: #2e3440; color: #d8dee9; }

	.active-choice {
		outline: 3px solid var(--cm-fg);
		outline-offset: -3px;
	}

	.scale-sizer {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.scale-sizer .cm-btn {
		flex: 1;
		min-height: 40px;
	}

	.scale-value {
		font-weight: 700;
		font-size: 1.1rem;
		min-width: 60px;
		text-align: center;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>

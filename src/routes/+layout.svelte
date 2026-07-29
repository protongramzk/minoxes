<script>
	import favicon from '$lib/assets/favicon.svg';
	import { theme, font, textScale } from '$lib/stores.js';
	import { page } from '$app/stores';
	import { BookOpen, Upload, SquarePen, Settings } from '@lucide/svelte';

	let { children } = $props();

	/**
	 * Computed isActive check for Bottom Nav links
	 * @param {string} path
	 * @returns {boolean}
	 */
	function isActive(path) {
		const currentPath = $page.url.pathname;
		if (path === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(path);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Import Google Fonts (Inter, Fira Sans, Space Grotesk, Lora, Merriweather) -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Global App Wrapper -->
<div class="cm-app">
	<main class="cm-main-content">
		{@render children()}
	</main>

	<!-- Spacer to prevent content from being hidden behind sticky bottom elements -->
	<div style="height: 120px;"></div>

	<!-- Bottom Navigation Bar (No emojis, Lucide icons only!) -->
	<nav class="cm-bottom-nav">
		<a href="/" class="cm-nav-item" class:is-active={isActive('/')}>
			<span class="cm-nav-icon"><BookOpen size={20} /></span>
			<span class="cm-nav-label">Library</span>
		</a>
		<a href="/upload" class="cm-nav-item" class:is-active={isActive('/upload')}>
			<span class="cm-nav-icon"><Upload size={20} /></span>
			<span class="cm-nav-label">Upload</span>
		</a>
		<a href="/writer" class="cm-nav-item" class:is-active={isActive('/writer')}>
			<span class="cm-nav-icon"><SquarePen size={20} /></span>
			<span class="cm-nav-label">Write</span>
		</a>
		<a href="/settings" class="cm-nav-item" class:is-active={isActive('/settings')}>
			<span class="cm-nav-icon"><Settings size={20} /></span>
			<span class="cm-nav-label">Settings</span>
		</a>
	</nav>
</div>

<style>
	@import '../lib/cassava-layout.css';
	@import '../lib/cassava-components.css';

	/* Smooth animation transition for all elements when themes change */
	:global(*) {
		transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
	}

	:global(:root) {
		/* Apply customizable scale factor for text elements */
		--cm-text-scale: 1.0;
	}

	/* Extend theme definitions with Sepia, Nord, and custom requested ones */
	:global(:root.dark) {
		--cm-bg: #111111;
		--cm-fg: #eeeeee;
		--cm-border: #444444;
		--cm-bg-inverse: #eeeeee;
		--cm-fg-inverse: #111111;
		--cm-bg-muted: #222222;
	}

	:global(:root.sepia) {
		--cm-bg: #f4ecd8;
		--cm-fg: #5b4636;
		--cm-border: #8f745d;
		--cm-bg-inverse: #5b4636;
		--cm-fg-inverse: #f4ecd8;
		--cm-bg-muted: #eaddc5;
	}

	:global(:root.nord) {
		--cm-bg: #2e3440;
		--cm-fg: #d8dee9;
		--cm-border: #4c566a;
		--cm-bg-inverse: #eceff4;
		--cm-fg-inverse: #2e3440;
		--cm-bg-muted: #3b4252;
	}

	/* Custom Requested Themes */
	:global(:root.strawberry) {
		--cm-bg: #fff0f5; /* soft pastel lavender/pink */
		--cm-fg: #8b2500; /* soft dark brownish red */
		--cm-border: #ffb6c1; /* light pink border */
		--cm-bg-inverse: #ffb6c1;
		--cm-fg-inverse: #fff0f5;
		--cm-bg-muted: #ffe4e1;
	}

	:global(:root.violet-light) {
		--cm-bg: #f3e5f5; /* light violet */
		--cm-fg: #4a148c; /* deep purple text */
		--cm-border: #d1c4e9; /* soft purple border */
		--cm-bg-inverse: #4a148c;
		--cm-fg-inverse: #f3e5f5;
		--cm-bg-muted: #e1bee7;
	}

	:global(:root.violet-dark) {
		--cm-bg: #120024; /* extremely dark violet */
		--cm-fg: #e0b0ff; /* mauve light violet text */
		--cm-border: #6a0dad; /* dark purple border */
		--cm-bg-inverse: #e0b0ff;
		--cm-fg-inverse: #120024;
		--cm-bg-muted: #2b0045;
	}

	:global(:root.emerald-cave) {
		--cm-bg: #062010; /* very dark emerald */
		--cm-fg: #50c878; /* rich emerald green text */
		--cm-border: #004b23; /* forest dark border */
		--cm-bg-inverse: #50c878;
		--cm-fg-inverse: #062010;
		--cm-bg-muted: #0c331a;
	}

	:global(:root.dark-ocean) {
		--cm-bg: #001220; /* deep dark marine blue */
		--cm-fg: #00bfff; /* deep sky blue text */
		--cm-border: #002d4a; /* marine border */
		--cm-bg-inverse: #00bfff;
		--cm-fg-inverse: #001220;
		--cm-bg-muted: #00223b;
	}

	/* Map font styles to bodies */
	:global(body.font-inter) {
		--cm-font-base: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	:global(body.font-fira) {
		--cm-font-base: 'Fira Sans', system-ui, -apple-system, sans-serif;
	}
	:global(body.font-space) {
		--cm-font-base: 'Space Grotesk', system-ui, -apple-system, monospace;
	}
	:global(body.font-times) {
		--cm-font-base: 'Times New Roman', Times, serif;
	}
	:global(body.font-lora) {
		--cm-font-base: 'Lora', Georgia, serif;
	}
	:global(body.font-merriweather) {
		--cm-font-base: 'Merriweather', Georgia, serif;
	}

	:global(body) {
		font-family: var(--cm-font-base);
		margin: 0;
		padding: 0;
		background-color: var(--cm-bg);
		color: var(--cm-fg);
		font-size: calc(1rem * var(--cm-text-scale));
		line-height: 1.5;
	}

	.cm-app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.cm-main-content {
		flex: 1;
		width: 100%;
	}

	.cm-bottom-nav {
		text-decoration: none;
	}

	.cm-nav-item {
		text-decoration: none;
		font-size: 0.85rem;
		gap: 2px;
	}

	.cm-nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
</style>

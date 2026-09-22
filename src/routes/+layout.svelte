<script>
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { theme, font, textScale } from '$lib/stores.js';
	import { page } from '$app/stores';
	import { BookOpen, Upload, SquarePen, Settings } from '@lucide/svelte';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js')
				.then((reg) => console.log('Service Worker registered successfully:', reg))
				.catch((err) => console.error('Service Worker registration failed:', err));
		}
	});

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

	<!-- Bottom Navigation Bar (Lucide icons) -->
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

	:global(:root) {
		--cm-text-scale: 1.0;
	}

	/* Extend theme definitions with smooth elevation colors and subtle borders */
	:global(:root.dark) {
		--cm-bg: #0f1115;
		--cm-bg-surface: #181b20;
		--cm-bg-elevated: #22262e;
		--cm-fg: #f0f2f5;
		--cm-border: rgba(255, 255, 255, 0.1);
		--cm-bg-inverse: #f0f2f5;
		--cm-fg-inverse: #0f1115;
		--cm-bg-muted: #1c2026;
		--cm-shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
		--cm-shadow-md: 0 4px 12px rgba(0,0,0,0.4);
		--cm-shadow-lg: 0 10px 25px rgba(0,0,0,0.5);
	}

	:global(:root.sepia) {
		--cm-bg: #f4ecd8;
		--cm-bg-surface: #fbf6e9;
		--cm-bg-elevated: #ffffff;
		--cm-fg: #5b4636;
		--cm-border: rgba(91, 70, 54, 0.15);
		--cm-bg-inverse: #5b4636;
		--cm-fg-inverse: #f4ecd8;
		--cm-bg-muted: #eaddc5;
		--cm-shadow-sm: 0 1px 3px rgba(91, 70, 54, 0.08);
		--cm-shadow-md: 0 4px 12px rgba(91, 70, 54, 0.12);
	}

	:global(:root.nord) {
		--cm-bg: #2e3440;
		--cm-bg-surface: #3b4252;
		--cm-bg-elevated: #434c5e;
		--cm-fg: #eceff4;
		--cm-border: rgba(216, 222, 233, 0.12);
		--cm-bg-inverse: #eceff4;
		--cm-fg-inverse: #2e3440;
		--cm-bg-muted: #4c566a;
		--cm-shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
		--cm-shadow-md: 0 4px 12px rgba(0,0,0,0.3);
	}

	:global(:root.strawberry) {
		--cm-bg: #fff0f5;
		--cm-bg-surface: #ffffff;
		--cm-bg-elevated: #fff8fa;
		--cm-fg: #8b2500;
		--cm-border: rgba(255, 182, 193, 0.5);
		--cm-bg-inverse: #ffb6c1;
		--cm-fg-inverse: #8b2500;
		--cm-bg-muted: #ffe4e1;
	}

	:global(:root.violet-light) {
		--cm-bg: #f3e5f5;
		--cm-bg-surface: #ffffff;
		--cm-bg-elevated: #faf5fc;
		--cm-fg: #4a148c;
		--cm-border: rgba(209, 196, 233, 0.6);
		--cm-bg-inverse: #4a148c;
		--cm-fg-inverse: #f3e5f5;
		--cm-bg-muted: #e1bee7;
	}

	:global(:root.violet-dark) {
		--cm-bg: #120024;
		--cm-bg-surface: #1e0338;
		--cm-bg-elevated: #2a054d;
		--cm-fg: #e0b0ff;
		--cm-border: rgba(224, 176, 255, 0.15);
		--cm-bg-inverse: #e0b0ff;
		--cm-fg-inverse: #120024;
		--cm-bg-muted: #2b0045;
	}

	:global(:root.emerald-cave) {
		--cm-bg: #062010;
		--cm-bg-surface: #0a2e18;
		--cm-bg-elevated: #103f22;
		--cm-fg: #50c878;
		--cm-border: rgba(80, 200, 120, 0.2);
		--cm-bg-inverse: #50c878;
		--cm-fg-inverse: #062010;
		--cm-bg-muted: #0c331a;
	}

	:global(:root.dark-ocean) {
		--cm-bg: #001220;
		--cm-bg-surface: #001c33;
		--cm-bg-elevated: #002847;
		--cm-fg: #00bfff;
		--cm-border: rgba(0, 191, 255, 0.2);
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
		transition: background-color var(--cm-speed) ease, color var(--cm-speed) ease;
	}

	.cm-app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
		overflow-x: hidden;
	}

	.cm-main-content {
		flex: 1;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	.cm-bottom-nav {
		text-decoration: none;
	}

	.cm-nav-item {
		text-decoration: none;
		font-size: 0.8rem;
		gap: 2px;
	}

	.cm-nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
</style>

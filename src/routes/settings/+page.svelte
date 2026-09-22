<script>
	import { theme, font } from '$lib/stores.js';
	import { db } from '$lib/db.js';
	import { AlertTriangle } from '@lucide/svelte';

	let statusMsg = $state('');

	/**
	 * Select global UI theme
	 * @param {string} t
	 */
	function selectTheme(t) {
		theme.set(t);
	}

	/**
	 * Select global UI font
	 * @param {string} f
	 */
	function selectFont(f) {
		font.set(f);
	}

	async function clearAllData() {
		if (confirm('🚨 DANGER ZONE 🚨\n\nAre you absolutely sure you want to delete ALL documents? This action cannot be undone.')) {
			try {
				await db.documents.clear();
				statusMsg = 'All local database documents have been deleted successfully.';
				setTimeout(() => {
					statusMsg = '';
				}, 3000);
			} catch (err) {
				console.error(err);
				const errMsg = err instanceof Error ? err.message : String(err);
				alert('Failed to clear database: ' + errMsg);
			}
		}
	}
</script>

<header class="cm-thumb-header">
	<h1 class="cm-header-title">SETTINGS</h1>
	<p class="cm-header-subtitle">Manage preferences and clear local databases.</p>
</header>

<div class="cm-container">
	<div class="settings-wrapper">
		{#if statusMsg}
			<div class="alert alert-success">{statusMsg}</div>
		{/if}

		<!-- Theme Picker -->
		<div class="settings-group">
			<h3 class="group-title">Global Theme</h3>
			<p class="group-desc">Choose the default color scheme for the application.</p>
			<div class="theme-grid">
				<button
					class="cm-btn theme-choice light-choice"
					class:active-choice={$theme === 'light'}
					onclick={() => selectTheme('light')}
				>
					Light Mode
				</button>
				<button
					class="cm-btn theme-choice dark-choice"
					class:active-choice={$theme === 'dark'}
					onclick={() => selectTheme('dark')}
				>
					Dark Mode (OLED)
				</button>
				<button
					class="cm-btn theme-choice sepia-choice"
					class:active-choice={$theme === 'sepia'}
					onclick={() => selectTheme('sepia')}
				>
					Sepia (Warm)
				</button>
				<button
					class="cm-btn theme-choice nord-choice"
					class:active-choice={$theme === 'nord'}
					onclick={() => selectTheme('nord')}
				>
					Nord (Cold Slate)
				</button>
				<button
					class="cm-btn theme-choice strawberry-choice"
					class:active-choice={$theme === 'strawberry'}
					onclick={() => selectTheme('strawberry')}
				>
					Strawberry Pink
				</button>
				<button
					class="cm-btn theme-choice violet-light-choice"
					class:active-choice={$theme === 'violet-light'}
					onclick={() => selectTheme('violet-light')}
				>
					Violet Light
				</button>
				<button
					class="cm-btn theme-choice violet-dark-choice"
					class:active-choice={$theme === 'violet-dark'}
					onclick={() => selectTheme('violet-dark')}
				>
					Violet Dark
				</button>
				<button
					class="cm-btn theme-choice emerald-cave-choice"
					class:active-choice={$theme === 'emerald-cave'}
					onclick={() => selectTheme('emerald-cave')}
				>
					Emerald Cave
				</button>
				<button
					class="cm-btn theme-choice dark-ocean-choice"
					class:active-choice={$theme === 'dark-ocean'}
					onclick={() => selectTheme('dark-ocean')}
				>
					Deep Dark Ocean
				</button>
			</div>
		</div>

		<!-- Font Picker -->
		<div class="settings-group">
			<h3 class="group-title">Interface Font</h3>
			<p class="group-desc">Select the typography style applied across user interface actions.</p>
			<div class="font-grid">
				<button
					class="cm-btn font-choice"
					style="font-family: 'Inter';"
					class:active-choice={$font === 'inter'}
					onclick={() => selectFont('inter')}
				>
					Inter (Clean Sans)
				</button>
				<button
					class="cm-btn font-choice"
					style="font-family: 'Fira Sans';"
					class:active-choice={$font === 'fira'}
					onclick={() => selectFont('fira')}
				>
					Fira Sans (Humanist)
				</button>
				<button
					class="cm-btn font-choice"
					style="font-family: 'Space Grotesk';"
					class:active-choice={$font === 'space'}
					onclick={() => selectFont('space')}
				>
					Space Grotesk (Tech)
				</button>
				<button
					class="cm-btn font-choice"
					style="font-family: 'Times New Roman';"
					class:active-choice={$font === 'times'}
					onclick={() => selectFont('times')}
				>
					Times New Roman (Classic)
				</button>
				<button
					class="cm-btn font-choice"
					style="font-family: 'Lora';"
					class:active-choice={$font === 'lora'}
					onclick={() => selectFont('lora')}
				>
					Lora (Humanist Serif)
				</button>
				<button
					class="cm-btn font-choice"
					style="font-family: 'Merriweather';"
					class:active-choice={$font === 'merriweather'}
					onclick={() => selectFont('merriweather')}
				>
					Merriweather (Serif)
				</button>
			</div>
		</div>

		<!-- Danger Zone -->
		<div class="settings-group danger-zone">
			<h3 class="group-title danger-title"><AlertTriangle size={18} class="btn-icon" /> Danger Zone</h3>
			<p class="group-desc text-danger">Permanently erase all locally stored data inside IndexedDB database.</p>
			<button class="cm-btn btn-danger-action" onclick={clearAllData}>
				Hapus Semua Data
			</button>
		</div>
	</div>
</div>

<style>
	.settings-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.settings-group {
		border: 1px solid var(--cm-border);
		border-radius: var(--cm-radius);
		background-color: var(--cm-bg-surface);
		box-shadow: var(--cm-shadow-sm);
		padding: var(--space-4);
		box-sizing: border-box;
	}

	.group-title {
		margin: 0 0 var(--space-1) 0;
		font-size: 1.15rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.group-desc {
		margin: 0 0 var(--space-3) 0;
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.theme-grid,
	.font-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: var(--space-2);
	}

	@media (min-width: 450px) {
		.theme-grid,
		.font-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.theme-choice,
	.font-choice {
		font-size: 0.88rem;
		justify-content: center;
		min-height: 44px;
		border-radius: var(--cm-radius-sm);
		border: 1px solid var(--cm-border);
	}

	.light-choice { background-color: #ffffff; color: #111111; }
	.dark-choice { background-color: #111111; color: #eeeeee; }
	.sepia-choice { background-color: #f4ecd8; color: #5b4636; }
	.nord-choice { background-color: #2e3440; color: #d8dee9; }
	.strawberry-choice { background-color: #fff0f5; color: #8b2500; }
	.violet-light-choice { background-color: #f3e5f5; color: #4a148c; }
	.violet-dark-choice { background-color: #120024; color: #e0b0ff; }
	.emerald-cave-choice { background-color: #062010; color: #50c878; }
	.dark-ocean-choice { background-color: #001220; color: #00bfff; }

	.active-choice {
		box-shadow: 0 0 0 2px var(--cm-fg);
	}

	.danger-zone {
		border-color: rgba(211, 47, 47, 0.3);
		background-color: rgba(211, 47, 47, 0.03);
	}

	.danger-title {
		color: #d32f2f;
	}

	.text-danger {
		color: #d32f2f;
		opacity: 0.9;
	}

	.btn-danger-action {
		width: 100%;
		border: 1px solid #d32f2f;
		background-color: transparent;
		color: #d32f2f;
		border-radius: var(--cm-radius-sm);
	}

	.btn-danger-action:hover {
		background-color: #d32f2f;
		color: white;
	}

	.alert {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--cm-radius);
		border: 1px solid var(--cm-border);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.alert-success {
		background-color: rgba(46, 125, 50, 0.08);
		color: #2e7d32;
		border-color: rgba(46, 125, 50, 0.2);
	}
</style>

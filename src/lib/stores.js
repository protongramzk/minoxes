import { writable } from 'svelte/store';

// Set default values and check if running in browser
const isBrowser = typeof window !== 'undefined';

const initialTheme = isBrowser ? (localStorage.getItem('minoxes-theme') || 'light') : 'light';
const initialFont = isBrowser ? (localStorage.getItem('minoxes-font') || 'inter') : 'inter';
const initialTextScale = isBrowser ? parseFloat(localStorage.getItem('minoxes-text-scale') || '1.0') : 1.0;

export const theme = writable(initialTheme);
export const font = writable(initialFont);
export const textScale = writable(initialTextScale);

if (isBrowser) {
	theme.subscribe((value) => {
		localStorage.setItem('minoxes-theme', value);
		// Apply class directly to html/body element
		const root = document.documentElement;
		root.className = ''; // Reset
		if (value !== 'light') {
			root.classList.add(value);
		}
	});

	font.subscribe((value) => {
		localStorage.setItem('minoxes-font', value);
		const body = document.body;
		// Remove existing font classes if any
		body.classList.forEach((cls) => {
			if (cls.startsWith('font-')) {
				body.classList.remove(cls);
			}
		});
		body.classList.add(`font-${value}`);
	});

	textScale.subscribe((value) => {
		localStorage.setItem('minoxes-text-scale', value.toString());
		document.documentElement.style.setProperty('--cm-text-scale', value.toString());
	});
}

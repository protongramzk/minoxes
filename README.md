# 📦 MINOXES

> **Minoxes** is a lightweight, 100% client-side, offline-first document reader and writer. Engineered with Svelte 5, SvelteKit, and Dexie.js (IndexedDB), Minoxes lets you manage, read, and write documents seamlessly directly in your browser with zero server reliance and absolute data privacy.

---

## ✨ Core Features

### 🔍 1. Multi-Format Document Reader
Minoxes provides robust, local client-side parsers for diverse document types:
*   **Markdown (`.md`):** Rendered elegantly using `marked` with custom prose styling.
*   **Plain Text (`.txt`):** Auto-preserves line breaks and layouts.
*   **Word Documents (`.docx`):** Parsed dynamically into clean HTML utilizing `mammoth.js`.
*   **Spreadsheets (`.xlsx`, `.xls`, `.csv`):** Rendered as interactive, tabbed HTML tables powered by `SheetJS (xlsx)`.
*   **Portable Document Format (`.pdf`):** Virtualized page-by-page rendering on an HTML5 `<canvas>` via `pdfjs-dist` to avoid browser crashes on massive documents.
*   **Native Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`):** Rendered natively with responsive image containers.

### ✍️ 2. WYSIWYG Tiptap Markdown Writer
Experience a seamless writing environment with a custom **Tiptap Markdown Editor**:
*   **Bidirectional Markdown:** Seamlessly parses raw markdown strings into the rich text editor, and serializes your modifications back to markdown strings upon saving.
*   **Rich Format Toolbar:** Quick formatting options for Bold, Italic, Inline Code, Headings (H1/H2), Bullet Lists, Numbered Lists, and Blockquotes with Lucide icons.
*   **Cassava Mono Styling:** Highly tailored editor layout conforming strictly to no-radius, no-shadow styling.

### 📱 3. Progressive Web App (PWA) & Offline Capability
Designed for instant startup and offline utility:
*   **Web App Manifest:** Configured in `static/manifest.json` for custom display mode, portrait locking, dark theme-color, and standalone mobile app installation.
*   **Service Worker:** Powered by a customized `static/sw.js` using a **stale-while-revalidate** caching strategy. It caches key app shells and assets to guarantee standard launch offline.
*   **Offline-First IndexedDB:** All your uploaded files and drafted markdown documents are stored as persistent `Blob` records inside a local **Dexie.js** IndexedDB.

### 🎨 4. Customizable Reader Experience
Personalize your reading interface with the Bottom Sheet Reader Options:
*   **Diverse Color Schemes:** Choose from 9 tailored theme presets: Light, OLED Dark, Warm Sepia, Nord, Strawberry Pink, Violet Light, Violet Dark, Emerald Cave, and Deep Dark Ocean.
*   **Typography Controls:** Instantly swap base fonts across Inter, Fira Sans, Space Grotesk, Times New Roman, Lora, and Merriweather.
*   **Responsive Text Sizing:** Dynamically scale text sizes up and down between 60% and 250% for optimal readability.

---

## 📐 Design Philosophy: Cassava Mono

Minoxes strictly adheres to **Cassava Mono UI** guidelines, focusing on **Position before Decoration**:
*   **Sharp, No-Radius Corners:** Absolute `border-radius: 0` across all buttons, cards, containers, inputs, and active selections.
*   **No Shadow, Flat Borders:** Zero `box-shadow` decoration. Depth is established purely through distinct z-index layers and neat 1px solid borders.
*   **Strict 4px Spatial Grid:** All spacing (margins, paddings, gaps) maps strictly to multiples of 4px to ensure visual rhythm.
*   **Thumb Priority Layouts:** Navigations (`cm-bottom-nav`), action toolbars (`cm-thumb-action-bar`), and search tools are anchored safely at the bottom zones of the viewport for comfortable, thumb-friendly single-handed mobile navigation.

---

## 🛠️ Developer Commands

### Getting Started
Ensure you have Node.js and [pnpm](https://pnpm.io/) installed.

1.  **Clone the Repository** and open the workspace.
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Production Build & Launch
*   **Run Development Server:**
    ```bash
    pnpm run dev
    ```
*   **Check Diagnostics and Types:**
    ```bash
    pnpm run check
    ```
*   **Compile Production Build:**
    ```bash
    pnpm run build
    ```
*   **Preview Local Production Build:**
    ```bash
    pnpm run preview
    ```

---

## 🧱 Architecture & Dependencies

Minoxes is an offline-only client application constructed using modern web standards:
*   **Framework:** [Svelte 5](https://svelte.dev/) & [SvelteKit](https://svelte.dev/docs/kit/introduction)
*   **Database:** [Dexie.js](https://dexie.org/) (Client-Side IndexedDB wrapper)
*   **Rich Editor:** [Tiptap Core](https://tiptap.dev/) + StarterKit + [Tiptap Markdown Extension](https://tiptap.dev/docs/editor/markdown)
*   **Parsers:**
    *   `marked` (Markdown compiler)
    *   `mammoth` (Word .docx to HTML)
    *   `xlsx` (SheetJS Excel spreadsheet and CSV parser)
    *   `pdfjs-dist` (PDF canvas renderer)
*   **Icons:** `@lucide/svelte`

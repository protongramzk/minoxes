# 🧠 MINOXES - AI AGENT MASTER CONCEPT

> **SYSTEM PROMPT UNTUK AI AGENT:** 
> Anda sedang membaca master concept untuk proyek **Minoxes**. Gunakan dokumen ini sebagai panduan utama (Single Source of Truth) untuk arsitektur, UI/UX, dan implementasi fitur. Jangan menyimpang dari filosofi UI "Cassava Mono" dan selalu gunakan pendekatan *Client-Side Offline First* menggunakan Dexie.js.

---

## 🏗️ 1. RINGKASAN PROYEK
**Minoxes** adalah aplikasi document reader dan writer berbasis Svelte yang 100% berjalan di client-side. Aplikasi ini dirancang untuk membaca berbagai format dokumen dan menulis catatan (Markdown) dengan fokus pada performa ringan, tanpa bloatware, dan sangat ramah penggunaan satu tangan di mobile (Thumb-Friendly).

- **Framework:** Svelte / SvelteKit (Static/SPA)
- **Database:** Dexie.js (IndexedDB)
- **Styling:** Cassava Mono (Custom CSS, no-Tailwind required untuk core components)

---

## 🎯 2. MVP (MINIMUM VIABLE PRODUCT) FITUR WAJIB
Agar Minoxes dikategorikan "Bekerja", fitur berikut WAJIB ada:
1. **Upload & Simpan:** Mampu menerima file lewat input/dropzone dan menyimpannya sebagai `Blob` di Dexie.js beserta metadata (nama, tipe, ukuran, tanggal).
2. **Delete:** Mampu menghapus dokumen dari database Dexie.
3. **Read (Multi-format):** Mampu membuka dan merender file dari database sesuai formatnya (MD, TXT, PDF, DOCX, XLSX/CSV, Images).
4. **Write (Markdown Only):** Mampu membuat dokumen teks baru, diedit dalam format markdown, dan disimpan ke database.
5. **Dark/Light Mode:** Tema yang bisa di-switch dan disimpan preferensinya (local storage/Dexie).

---

## 📂 3. DAFTAR PAGE & TANGGUNG JAWAB
Struktur routing menggunakan SvelteKit.

*   **`/` (Home):** 
    *   Menampilkan daftar dokumen dari Dexie.js (urut berdasarkan tanggal terbaru).
    *   Mempunyai fitur pencarian lokal (filter array).
    *   Aksi swipe/klik untuk *Delete* atau *Open* file.
*   **`/upload` (Upload File):** 
    *   Antarmuka untuk unggah dokumen. 
    *   Mendeteksi MIME type dan ekstensi untuk menentukan kategori parser.
    *   Mengeksekusi penyimpanan Blob ke Dexie.js.
*   **`/writer` (Markdown Writer):** 
    *   Halaman khusus untuk mengetik.
    *   HANYA memproduksi dan mengedit file `.md`.
    *   Menggunakan `cm-thumb-action-bar` untuk tombol "Simpan" dan "Batal".
*   **`/reader/[id]` (Dynamic Reader):** 
    *   Mengambil Blob dari Dexie berdasarkan ID.
    *   Melakukan routing internal (Svelte `#if`) ke Viewer component yang tepat berdasarkan `doc.type`.
*   **`/settings` (Settings):** 
    *   Toggle Dark/Light mode.
    *   Danger zone: "Hapus Semua Data" (Clear Dexie DB).

---

## ⚙️ 4. PENGGUNAAN PARSER & LIBRARIES
Semua parsing dilakukan di browser. Dilarang menggunakan API backend.

1.  **Marked.js (`md`, `txt`):** 
    *   Mengubah text content menjadi HTML HTML text. Render di Svelte menggunakan `{@html content}`.
2.  **PDF.js (`pdf`):** 
    *   Gunakan `pdfjs-dist`. WAJIB set worker src via Vite asset import. Render ke dalam elemen `<canvas>`. Jika bisa, buat fitur render per halaman (virtualized) agar tidak crash pada PDF besar.
3.  **Mammoth.js (`docx`):** 
    *   Gunakan metode `.convertToHtml({ arrayBuffer })`. Hasilnya langsung disuntikkan ke dalam artikel container.
4.  **SheetJS / xlsx (`sheet`, `csv`):** 
    *   Gunakan versi CDN/Tarball. Baca Blob sebagai ArrayBuffer, parse workbook, lalu render ke bentuk HTML Table (`utils.sheet_to_html`).
5.  **Native Browser API (`image`):** 
    *   Gunakan `URL.createObjectURL(blob)` untuk merender gambar di tag `<img>`.

---

## 🎨 5. FILOSOFI UI: CASSAVA MONO
Ini adalah hukum mutlak UI Minoxes. **Position before Decoration.**
*   **TANPA BORDER RADIUS:** `border-radius: 0` di semua elemen. Harus kotak tajam.
*   **TANPA SHADOW:** `box-shadow: none`. Kedalaman (depth) ditentukan oleh urutan Layer (z-index) dan border 1px solid.
*   **SPATIAL GRID:** Semua margin, padding, gap harus kelipatan 4px (var `--space-*`). Dilarang memakai angka ganjil/acak.
*   **THUMB PRIORITY:** 
    *   Navigasi utama (`cm-bottom-nav`) dan aksi tombol utama (`cm-thumb-action-bar`, `cm-fab`) WAJIB diletakkan di bawah (zona ibu jari).
    *   Header (`cm-thumb-header`) harus besar (35-45% viewport) untuk mendorong konten ke bawah agar mudah dijangkau. Mengecil saat discroll.
    *   Jangan letakkan interaksi krusial di pojok kiri/kanan atas layar.

---

## 🌗 6. IMPLEMENTASI LIGHT MODE & DARK MODE
Karena menggunakan CSS Variables, tema cukup ditangani dengan menukar nilai variabel pada root atau menambahkan class `.dark` pada `<html>`/`<body>`.

**Contoh Sistem Tema (CSS):**
```css
:root {
  --cm-bg: #ffffff;
  --cm-fg: #111111;
  --cm-border: #111111;
  --cm-bg-inverse: #111111;
  --cm-fg-inverse: #ffffff;
}

:root.dark {
  --cm-bg: #111111;
  --cm-fg: #eeeeee;
  --cm-border: #444444;
  --cm-bg-inverse: #eeeeee;
  --cm-fg-inverse: #111111;
}
```
**Perilaku Svelte:**
Gunakan store Svelte (`writable`) untuk menyimpan state tema. Sinkronkan dengan `localStorage` (atau Dexie). Saat aplikasi dimuat, cek state ini dan aplikasikan class `.dark` ke `document.documentElement`.

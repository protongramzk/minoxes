# 📖 MINOXES - UI/UX & RENDERING PHILOSOPHY

> **SYSTEM PROMPT UNTUK AI AGENT:**
> Dokumen ini mendefinisikan filosofi rendering dokumen dan tipografi di dalam Minoxes. Jika `CONCEPT.md` adalah otak dari arsitektur, maka `PHILOSOPHY.md` adalah jiwa dari pengalaman membaca (Reading Experience). Jangan membuat gaya yang bertabrakan dengan prinsip di bawah ini.

---

## 🏛️ 1. UNIFIED RENDERING (Satu Tampilan Untuk Semua)
Semua dokumen tekstual **WAJIB** memiliki layout dan *style formatting* yang diseragamkan. 
- **Docx** (dari HTML Mammoth), **Markdown**, **TXT**, dan bahkan **XLSX** (SheetJS) harus di-render menggunakan *base class* CSS yang sama (misal: class `.cm-prose` atau `.cm-reader-content`).
- Heading 1 di Docx harus terlihat persis sama dengan Heading 1 di Markdown.
- **PENGECUALIAN:** `PDF`. Karena PDF dirender menggunakan `<canvas>` via `pdfjs-dist` dengan tata letak statis (fixed-layout) bawaan dokumen aslinya.

---

## 🌬️ 2. BREATHING TEXT (Teks yang Bernafas)
Teks tidak boleh terasa sesak atau terlalu renggang.
- Terapkan **Dynamic Padding** yang perubahannya sangat kecil namun responsif terhadap ukuran *viewport* (menggunakan `clamp()` atau unit `vw`/`vh` dalam skala minor).
- Contoh: `padding: clamp(16px, 2vw, 24px) clamp(16px, 3vw, 32px);`
- Tujuannya agar mata pembaca tidak cepat lelah saat transisi dari HP layar kecil ke tablet.

---

## ✒️ 3. HUMANIST TYPOGRAPHY
Tipografi harus dirancang agar "humanis", mengutamakan kenyamanan mata manusia dibanding sekadar estetika geometris kaku.
- **Max-width:** Lebar paragraf dibatasi (idealnya 65-75 karakter per baris) agar mata tidak terlalu jauh menyapu layar dari kiri ke kanan.
- **Line-height:** Rentang `1.5` hingga `1.65` untuk teks paragraf biasa.
- **Hierarki:** Perbedaan ukuran antar Heading (H1, H2, H3) dan paragraf harus jelas tapi tidak terlalu drastis (moderate typographic scale).

---

## 📊 4. PENANGANAN KHUSUS EXCEL (XLSX/CSV)
Meskipun tabel memiliki data yang luas, prinsip UI harus tetap menyatu dengan *Unified Theme*.
- **Layout Luas:** Tabel diizinkan untuk memecah *max-width* pembacaan dan menggunakan *horizontal scroll* (`overflow-x: auto;`).
- **Unified Theme:** Warna background sel, border tabel, dan warna teks **WAJIB** mengikuti variabel CSS tema pembaca yang sedang aktif (Light/Dark/Sepia). Dilarang membawa *hardcoded styling* bawaan dari file Excel aslinya.

---

## 🎨 5. FITUR THEMING (Pengaturan Reader)
Minoxes menyediakan kustomisasi tingkat lanjut khusus di dalam *Reader View* untuk kenyamanan individu. Fitur ini harus diimplementasikan dengan memanipulasi CSS Variables pada root pembaca.

### A. Skema Warna (Color Schemes)
- **Light:** Putih bersih dengan teks abu-abu sangat gelap.
- **Dark:** Hitam murni (OLED friendly) dengan teks abu-abu terang.
- **Sepia:** Warna krem/kertas tua kecoklatan untuk membaca malam hari dengan teks coklat gelap (mengurangi ketegangan mata).
- **Nord / Slate:** (Opsional) Abu-abu kebiruan untuk nuansa dingin.

### B. Pilihan Font (Font Families)
Pengguna bisa mengganti font utama untuk membaca dokumen (di luar PDF). Opsi wajib:
1. **Inter** (Default - Clean Sans-serif)
2. **Fira Sans** (Humanist Sans-serif)
3. **Space Grotesk** (Modern/Tech vibe)
4. **Times New Roman** (Classic Serif)
5. **Lora / Merriweather** (Opsional - Humanist Serif untuk bacaan panjang)


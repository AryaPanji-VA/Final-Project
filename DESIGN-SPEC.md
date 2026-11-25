# Lorekeeper — Visual Design & UI Specification

Versi: 1.0 · Basis: kode existing di `~/Projects/LoreKeeper` (React + Vite, Tailwind v4, Shadcn-style, React Router, RHF, Zod, Lucide).

Dokumen ini adalah spesifikasi, bukan kode. Semua nama token mengacu pada konvensi Tailwind v4 (`--color-*` di `@theme`) supaya bisa langsung ditranskripsi ke `src/index.css` dan class utility (`bg-surface`, `text-ivory`, dll).

---

## 1. Arah Visual

Konsep gabungan: **Dark Academia × Fantasy Encyclopedia × Modern Editorial**.

Prinsip yang mengikat semua keputusan:

1. **Arsip, bukan dashboard.** Konten didominasi teks editorial yang dibaca, bukan grid metrik. Statistik ditulis seperti angka folio (serif besar + caption kecil), bukan KPI card berwarna.
2. **Satu aksen hangat per layar.** Gold (#C8A24B) hanya untuk: indikator aktif, fokus, dan satu tindakan utama per halaman. Sage (#8FA08B) untuk status dan kategori. Tidak ada gradien selain overlay gelap di cover image.
3. **Hierarki lewat tipografi dan ruang, bukan warna.** Judul serif Newsreader, body Inter, kontras teks utama vs sekunder 2 tingkat saja (ivory vs gray-green).
4. **Radius kecil (6–10px), border 1px, shadow nyaris tak terlihat.** Kedalaman datang dari perbedaan tone surface (bg → surface → card), bukan drop shadow.
5. **Motion minimal:** 150–200ms, hanya opacity/transform/color. Skeleton, bukan spinner, untuk area konten.

Anti-pattern yang dilarang (sesuai brief): glassmorphism, gradien dekoratif, kartu super-round (radius ≥16px), ikon berwarna-warni, admin KPI strip, emas berlebihan.

---

## 2. Palet Warna (HEX)

Aplikasi berpindah dari tema terang existing ke tema gelap. Ganti nilai `@theme` di `src/index.css`, struktur token tidak berubah.

### Permukaan (gelap → sedikit lebih terang)

| Token | HEX | Penggunaan |
|---|---|---|
| `--color-background` | `#141613` | Primary background app (charcoal kehijauan) |
| `--color-surface` | `#1B1E1A` | Secondary background, sidebar, area sekunder (dark olive) |
| `--color-card` | `#232721` | Card background, form container, dialog |
| `--color-elevated` | `#2B302A` | Hover surface, tab aktif, dropdown, table row hover |

### Teks

| Token | HEX | Penggunaan |
|---|---|---|
| `--color-foreground` (ivory) | `#EAE6DA` | Primary text, judul |
| `--color-muted-foreground` | `#9AA093` | Secondary text, deskripsi, caption (desaturated gray-green) |
| `--color-faint` | `#6B7267` | Tersier: placeholder, disabled text, meta kecil |

### Aksen

| Token | HEX | Penggunaan |
|---|---|---|
| `--color-primary` (antique gold) | `#C8A24B` | Primary accent: indikator aktif, link, tombol utama, focus ring |
| `--color-primary-hover` | `#D9B55F` | Hover state gold |
| `--color-primary-muted` | `rgba(200,162,75,0.12)` | Background tipis gold (selected row, badge aktif) |
| `--color-secondary` (muted sage) | `#8FA08B` | Secondary accent: kategori, badge status, ikon sekunder |
| `--color-secondary-muted` | `rgba(143,160,139,0.12)` | Background tipis sage |

### Border & kontrol

| Token | HEX |
|---|---|
| `--color-border` | `#2E332C` (subtle warm gray, 1px, digunakan global) |
| `--color-border-strong` | `#3D4339` (divider menonjol, input focus) |
| `--color-input` | `#3D4339` |

### Status

| Token | HEX | Penggunaan |
|---|---|---|
| `--color-success` | `#7C9A6D` | Canon entry, simpan berhasil |
| `--color-warning` | `#D9A441` | Draft / canon-status caution |
| `--color-destructive` | `#C0603F` | Error, hapus (terracotta, bukan merah murni, agar tetap hangat) |
| `--color-destructive-muted` | `rgba(192,96,63,0.14)` | Background error banner |

Kontras: ivory di `#141613` ≈ 13:1; muted-foreground ≈ 5.6:1 (lolos AA untuk teks kecil); gold di background gelap ≈ 6:1. Aman.

---

## 3. Tipografi

Font tetap dari theme existing: **Newsreader** (serif, editorial) dan **Inter** (sans, UI). Tambah bobot 700 untuk Inter di import.

### Skala

| Peran | Font | Size / line-height | Weight | Tracking |
|---|---|---|---|---|
| Display (login/empty hero) | Newsreader | 40px / 1.15 | 500 | -0.02em |
| Page title | Newsreader | 30px / 1.2 | 500 | -0.01em |
| Section title | Newsreader | 20px / 1.3 | 500 | normal |
| Card title | Newsreader | 17px / 1.35 | 500 | normal |
| Body | Inter | 14px / 1.6 | 400 | normal |
| Body large (deskripsi halaman) | Inter | 15px / 1.65 | 400 | normal |
| Label form | Inter | 13px / 1.4 | 500 | normal |
| Caption / meta | Inter | 12px / 1.4 | 400 | 0.02em |
| Overline (label section, NAV GROUP) | Inter | 11px / 1.2 | 600 | 0.12em, uppercase |
| Angka statistik | Newsreader | 34px / 1 | 500 | -0.01em |

Aturan:
- Semua judul memakai `font-serif` (Newsreader). UI, form, body memakai `font-sans`.
- Italic Newsreader hanya untuk kutipan/epigraph (tagline di halaman auth).
- Maksimal 2 tingkat abu-abu teks per layar; meta kecil boleh tingkat ketiga.
- Panjang baris baca: `max-w-[68ch]` untuk deskripsi halaman.

---

## 4. Spacing, Radius, Shadow, Layout

### Spacing scale (mengikuti Tailwind default, gunakan kelipatan ini saja)
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Aturan umum:
- Padding konten halaman: 32px (desktop), 16px (mobile).
- Jarak antar section: 48–64px.
- Jarak antar kartu dalam grid: 16–20px.
- Padding dalam kartu: 20px (standar), 24px (kartu fitur besar).
- Form: jarak antar field 20px; label→input 6px; input→error 4px.

### Container
- Konten utama: `max-w-[1120px]` untuk dashboard/list; `max-w-[720px]` untuk form dan editor (garis baca nyaman).
- Center, tidak perlu gutters tambahan di dalam main.

### Radius & shadow

| Elemen | Radius | Shadow |
|---|---|---|
| Card, dialog | 10px | `0 1px 2px rgba(0,0,0,0.3)` — nyaris tak terlihat |
| Button, input, dropdown, badge | 6px | none |
| Sidebar item aktif | 6px | none |
| Cover image card | 8px atas | none |
| Skeleton | 6px | none |

Prinsip: shadow hanya untuk elemen yang melayang (dialog, dropdown). Kartu statis cukup border + tone difference.

---

## 5. Application Shell

```
┌──────────┬──────────────────────────────────────────────┐
│          │ Navbar (56px, sticky)                        │
│ Sidebar  ├──────────────────────────────────────────────┤
│ 264px    │ Breadcrumbs (opsional, 20px di bawah navbar) │
│ sticky   │ Main content (max-w 1120px, py-32px)         │
│ full-h   │                                              │
│          │ Footer tipis 1-baris (border-top)            │
└──────────┴──────────────────────────────────────────────┘
```

### Sidebar (264px, `bg-surface`, border-right `--color-border`, sticky, full height)

Bagian dari atas ke bawah:
1. **Wordmark (72px):** ikon BookMarked gold + "Lorekeeper" Newsreader 20px ivory. Border-bottom.
2. **Universe switcher (48px, hanya saat universe terpilih):** dropdown — cover thumbnail 24px bulat + nama universe + ChevronDown. Ini satu-satunya cara navigasi antar universe; state di-angkat ke context nanti.
3. **NAV GROUP "WORKSPACE":** Dashboard (LayoutDashboard), My Universes (Library), Discover (Compass).
4. **NAV GROUP "WORLD BUILDING"** (muncul hanya saat universe aktif; jika tidak ada, group disembunyikan — tidak di-disable): Encyclopedia (BookOpen), Timeline (Hourglass). Link ke `/universes/:id/lore` dan `/universes/:id/timeline`.
5. **NAV GROUP "ACCOUNT" (menempel di bawah):** Settings (Settings), Profile (CircleUser), Logout (LogOut, warna destructive saat hover).
6. **Primary CTA (paling bawah):** "New Universe" — tombol gold full-width, di atas footer sidebar.

Spesifikasi item nav:
- Tinggi 36px, padding-x 12px, gap ikon-teks 10px, ikon 16px `text-faint`.
- Default: teks `--color-muted-foreground`.
- Hover: `bg-elevated`, teks ivory.
- **Aktif:** `bg-primary-muted` + teks ivory + ikon gold + **indikator bar 2px gold di sisi kiri** (absolute, inset-y 8px). Ini identitas visual utama sidebar.
- Label group: overline 11px `text-faint`, padding 12px, margin-top 24px antar group.

### Navbar (56px, sticky, `bg-background/95 + backdrop-blur[2px]`, border-bottom)

- Kiri: breadcrumb inline (Contoh: `My Universes / Aethermoor / Encyclopedia`, terakhir berwarna ivory, sisanya muted, separator `/` 12px faint). Halaman tanpa universe: breadcrumb disembunyikan, ganti dengan tagline "The Archive of Imagined Worlds" italic serif 14px muted.
- Kanan: tombol ikon Search (buka dialog pencarian global — bisa berupa stub), avatar user 28px bulat + nama 13px.
- Mobile: kiri = wordmark kecil, kanan = avatar + tombol hamburger (membuka drawer sidebar).

### PageHeader (komponen, dipakai semua halaman dalam)

- `pt-32px pb-24px`, border-bottom 1px, margin-bottom 32px.
- Baris 1: overline kategori halaman (opsional, misal "WORLDBUILDING / ENCYCLOPEDIA").
- Baris 2: H1 Newsreader 30px ivory + actions di kanan (flex wrap).
- Baris 3: deskripsi 15px muted, `max-w-[68ch]`.

### Konten & footer
- Main `px-32px py-32px`; footer: 1 baris 12px faint, border-top, "Lorekeeper — The Archive of Imagined Worlds".

---

## 6. Spesifikasi Halaman (top → bottom)

### 6.1 Login — route `/login`, layout `AuthLayout` (tanpa sidebar)

Tema: halaman pembuka arsip. Background `--color-background`; di sisi kiri (desktop ≥1024px) panel editorial 50%, kanan form.

1. **Panel kiri (editorial):** overline "THE ARCHIVE OF IMAGINED WORLDS", H1 serif display 40px: "Setiap dunia layak diarsipkan.", paragraf pendek muted, lalu epigraph italic serif 16px faint dengan garis vertikal gold 2px di kiri. Panel ini dibuang di mobile.
2. **Panel kanan:** kartu `bg-card` radius 10px border, max-w 400px, padding 32px.
   - Judul serif 20px "Masuk".
   - Field Email + Password (spesifikasi Input di §7). Error inline merah 12px di bawah field.
   - Tombol primary gold full-width 40px.
   - Divider tipis, lalu teks 13px muted: "Belum punya akun? Daftar" (link gold, underline on hover).
3. **Footer mini:** centered 12px faint "Lorekeeper © 2026".

### 6.2 Register — `/register`, `AuthLayout` sama

1. Panel kiri sama dengan copy berbeda: "Mulai arsip dunia pertamamu."
2. Kartu form: Nama, Email, Password, **Konfirmasi Password** (tambahkan di schema Zod dengan `refine` perbandingan). Syarat password ditampilkan sebagai helper 12px faint di bawah field ("Minimal 8 karakter"), berubah jadi success saat valid.
3. Tombol daftar + link balik ke login.

### 6.3 Dashboard — `/`

1. **PageHeader personalized:** H1 "Selamat datang kembali, {name}.", deskripsi 1 kalimat, actions: tombol primary "New Universe".
2. **Statistik (1 baris, 3 kolom, dipisah border vertikal bukan kartu):** Universes · Entri Lore · Peristiwa Timeline. Angka serif 34px + overline label + delta kecil 12px sage ("+2 minggu ini"). Bukan kartu — hanya angka dengan divider, sesuai prinsip editorial.
3. **Section "Universes terakhir dibuka" (H2 serif 20px + link "Lihat semua"):** horizontal row 3 kartu universe (spesifikasi §6.4) dengan meta "Dibuka 2 hari lalu".
4. **Section "Aktivitas terbaru":** list 5 item, tiap item = ikon kategori 16px dalam kotak 28px `bg-elevated` radius 6px + teks 14px ("Kamu memperbarui **Ordo Penjaga Angin**") + timestamp 12px faint. Separator border antar item.
5. **Quick actions:** baris 3 kartu kecil (border-dashed): "Tulis entri lore", "Tambah peristiwa", "Jelajahi Discover" — hover → border gold + ikon gold.

### 6.4 My Universes — `/universes`

1. **PageHeader** + action "New Universe" (gold).
2. **Toolbar (h-40px, sticky di bawah navbar saat scroll):** Input pencarian dengan ikon Search (maks-w 320px) + Select filter Genre (4 genre teratas) + Select "Urutkan" (Terbaru / A–Z / Terakhir diubah). Kanan: view toggle ikon Grid/List (2 ikon button, aktif = `bg-elevated`).
3. **Grid kartu universe:** 3 kolom desktop / 2 tablet / 1 mobile, gap 20px.
   - Kartu (radius 10px, `bg-card`, border): **cover 16:9** (rounded 8px atas; kalau tidak ada gambar: `bg-surface` dengan inisial serif 40px gold center), body 20px: judul serif 17px + genre badge sage + deskripsi 2 baris clamp muted 13px + meta 12px faint (jumlah entri · diubah terakhir).
   - Hover: `translateY(-2px)`, border → `border-strong`, shadow lembut. Klik → overview.
4. **Empty state** (jika 0 universe): komponen EmptyState dengan ilustrasi ikon BookOpen, CTA "Buat universe pertama".

### 6.5 Create Universe — `/universes/create`

1. **PageHeader** "Universe Baru" + deskripsi.
2. **Form satu kolom `max-w-[720px]` dalam kartu padding 24px:**
   - Nama (Input) — helper "Nama dunia yang akan tampil di arsip."
   - Genre (Select) + Visibility (Select: Privat / Publik) — berdampingan 2 kolom di ≥sm.
   - Deskripsi (Textarea 5 baris, counter karakter 12px di kanan bawah: "0/500").
   - **Cover image:** dropzone dashed border radius 8px tinggi 140px — ikon ImagePlus faint + teks 13px. Preview saat dipilih (object-cover). Ini visual-only dulu (belum upload backend).
   - Footer form: kanan-kiri — "Cancel" (ghost) dan "Buat Universe" (gold). Submit disabled saat `isSubmitting`.
3. Validasi inline Zod sesuai existing schema; error border destructive + pesan 12px.

### 6.6 Universe Overview — `/universes/:universeId`

1. **Cover strip (bukan hero full-bleed):** kontainer max-w 1120px, gambar 240px tinggi radius 10px, overlay gradien `linear-gradient(180deg, transparent 40%, rgba(20,22,19,0.85))`; di atas overlay kiri-bawah: H1 serif 30px ivory + genre badge sage + deskripsi 2 baris. Kalau tanpa cover: blok `bg-surface` dengan pola inisial.
2. **Statistik inline (1 baris, 4 item dipisah border):** Entri · Karakter · Lokasi · Peristiwa — angka serif 24px + label overline.
3. **Quick navigation (3 kartu horizontal):** Encyclopedia / Timeline / Editor — kartu `bg-card` dengan ikon, judul serif 17px, deskripsi 13px, arrow kanan faint; hover border gold.
4. **"Baru diperbarui":** list 5 entri lore (ikon kategori + judul + kategori badge + waktu), tiap baris border-bottom; klik → detail encyclopedia.
5. Empty state per section bila kosong (mis. timeline 0 peristiwa).

### 6.7 Lore Encyclopedia — `/universes/:universeId/lore`

1. **PageHeader** "Encyclopedia" + deskripsi universe + actions: "Entri Baru" (gold) + view toggle Grid/List.
2. **Toolbar:** Input search (placeholder "Cari entri...") + Select Kategori (Character/Location/Faction/Artifact/Mythology) + Select Sort.
3. **Grid entri (3 kolom):** kartu lebih tipis dari universe card — tanpa cover, melainkan:
   - Header: ikon kategori dalam kotak 32px `bg-secondary-muted` (ikon sage) + kategori overline 11px.
   - Judul serif 17px ivory.
   - Ringkasan 13px muted, 2 baris clamp.
   - Footer meta: status canon (badge, lihat §7) + tanggal update 12px faint.
   - Klik → **detail via Dialog** (bukan halaman baru, sesuai implementasi existing): dialog max-w 560px, header = kategori + judul serif 20px, body = ringkasan + tags, footer = tombol "Buka di Editor".
4. **List view (toggle):** baris tabel-santai — ikon + judul (col 30%) + kategori (20%) + canon (15%) + diubah (15%) + arrow. Border antar baris.
5. **Empty:** "Belum ada entri" + CTA "Tulis entri pertama". **No-results** (filter aktif): varian EmptyState tanpa CTA + tombol "Reset filter".

### 6.8 Lore Editor — `/universes/:universeId/lore/:loreId/edit` (dan entri baru)

1. **PageHeader** dengan breadcrumb kembali ke Encyclopedia di atas judul.
2. **Form `max-w-[720px]`:**
   - Judul (Input besar 16px).
   - Baris 2 kolom: Kategori (Select) + **Canon status** (Select: Canon / Draft / Legend — Legend = non-kanonik, badge warning).
   - Deskripsi singkat (Input).
   - **Konten (rich text area):** `min-h-[320px]` Textarea putih-nada dengan border; toolbar formatting minimal (Bold / Italic / H2 / List — ikon only, 32px) di atas area, border-bottom. Implementasi awal: textarea + toolbar visual; rich rendering menyusul tanpa dependency editor.
   - **Tags:** input chip — ketik → chip `bg-elevated` radius 6px dengan X kecil; maks 8 chip, ditampilkan di bawah input.
3. **Footer sticky (border-top, `bg-background`):** kiri status "Draft tersimpan otomatis · 12:04" 12px faint; kanan Cancel (ghost) + Save (gold).

### 6.9 Timeline — `/universes/:universeId/timeline`

1. **PageHeader** "Timeline" + action "Peristiwa Baru" (buka Dialog form: tanggal/era, judul, deskripsi).
2. **Konten: timeline vertikal editorial** (bukan kolom tanggal di kiri ala admin):
   - Garis vertikal 1px `--color-border` di kiri (offset 12px), node berupa **diamond 8px gold** (rotate 45°) untuk canon, sage untuk draft.
   - Tiap event: overline tanggal ("TAHUN 214"), judul serif 20px, deskripsi muted max-w 60ch. Jarak antar event 48px.
   - Era besar (mis. "Zaman Lentera") disisip sebagai **section divider**: garis horizontal + teks overline sage — memberi ritme editorial.
3. **Empty state:** "Sejarah dunia ini belum tertulis." + CTA.

### 6.10 Discover — `/discover`

Satu-satunya halaman dengan nuansa lebih "galeri" karena kontennya milik orang lain.

1. **Header editorial tanpa PageHeader biasa:** epigraph italic serif terpusat "Dunia yang dibagikan para penjaga lore." + H1 "Discover" + deskripsi. Tanpa actions.
2. **Featured (1 kartu lebar horizontal):** cover kiri 40% + kanan: overline "FEATURED", judul serif 24px, deskripsi, stat mini, tombol "Jelajahi dunia". Radius 10px, border, `bg-card`.
3. **Toolbar:** search + Select genre + Select sort (Populer / Terbaru).
4. **Grid kartu publik (3 kolom):** seperti kartu My Universes + baris bawah tambahan: avatar owner 20px + "oleh {owner}" 12px.
5. **Empty / no-result** sama pola dengan Encyclopedia.

---

## 7. Spesifikasi Komponen

Semua komponen ada di `src/components/ui` (shadcn-style) & `src/components/shared`. Angka berlaku desktop; perbedaan mobile di §8.

### Button (existing, sesuaikan token)
- Height: sm 32px / default 40px / lg 44px. Padding-x 16px, gap 8px, ikon 16px. Radius 6px. Font Inter 14px/500.
- **Primary (gold):** `bg-primary text-background`. Hover `bg-primary-hover`. Active: scale 0.98. Disabled: opacity 0.4, pointer-events tetap tapi `disabled:` styling.
- **Secondary:** `bg-elevated text-foreground`, hover `bg-surface`+border-strong.
- **Outline:** border `--color-input`, teks ivory, hover `bg-elevated`.
- **Ghost:** transparan, hover `bg-elevated`.
- **Destructive:** `bg-destructive/10 text-destructive border destructive/30`, hover solid.
- **Link (gold):** underline-offset 4px, hover underline.
- Focus ring: `ring-2 ring-primary ring-offset-2 ring-offset-background`.

### Input / Textarea / Select
- Height 40px, radius 6px, border 1px `--color-input`, `bg-card`, padding-x 12px, teks 14px ivory.
- Placeholder `--color-faint`.
- Focus: border `--color-primary` + `ring-1 ring-primary/40` (tanpa glow besar).
- Error: border destructive + pesan 12px destructive + `role="alert"`.
- Disabled: `bg-surface`, teks faint, cursor not-allowed.
- **Select:** sama, + ChevronDown 16px kanan (custom, karena Radix belum terpasang — pakai `<select>` native dengan appearance-none dulu, supaya tanpa dependency baru).
- **Textarea:** min-height sesuai konteks, resize-y, padding 12px.

### Card
- `bg-card` border radius 10px padding 20px. Varian: `interactive` (hover translateY -2px + border-strong + shadow lembut, cursor pointer) dan statis.
- Header layout: overline kategori (opsional) → judul serif → deskripsi muted.

### Dialog/Modal (existing Radix dialog)
- Overlay `bg-black/70` (lebih pekat dari existing 60%, untuk atmosfer).
- Konten: `bg-card` radius 10px border `--color-border-strong`, max-w 560px (form 480px), padding 24px, shadow `0 8px 32px rgba(0,0,0,0.45)`.
- Title serif 20px; Description 13px muted; footer kanan dengan gap 12px.
- Motion: overlay fade 150ms; konten `opacity 0→1, translateY(8px→0), scale(0.98→1)` 200ms ease-out; exit kebalikan 150ms.

### Badge
- Height 22px, padding-x 8px, radius 6px, font 11px/600 uppercase tracking 0.04em.
- Varian: `sage` (bg sage-muted, teks sage) untuk genre/kategori; `gold` (bg primary-muted, teks gold) untuk featured/aktif; `outline` (border saja, teks muted) untuk meta; `success`/`warning` untuk canon status (Canon = success, Draft = warning, Legend = outline).

### Tabs (untuk view toggle & section overview)
- Trigger: height 32px, padding-x 12px, teks 13px/500 muted; aktif: `bg-elevated` teks ivory + underline 2px gold (indicator animasi 150ms). Container: gap 4px, border-bottom 1px.

### Dropdown (sidebar universe switcher & user menu)
- Trigger & panel: panel `bg-card` border radius 8px, min-w 200px, padding 4px, shadow mengambang.
- Item: height 32px, padding-x 8px, teks 13px; hover `bg-elevated`; destructive item teks `--color-destructive`.
- Motion: fade+scale 150ms origin-top.
- Implementasi tanpa dependency: button + conditional render + klik-luar (bisa tulis hook kecil `useClickOutside`).

### Sidebar / Navbar / PageHeader
- Lengkap di §5. PageHeader props: `overline`, `title`, `description`, `actions`.

### LoadingState — ubah dari spinner ke **skeleton**
- Komponen `Skeleton`: blok `bg-elevated` radius 6px + animasi pulse (opacity 0.5↔1, 1.5s).
- Preset: `SkeletonCard` (cover + 2 baris), `SkeletonList` (4 baris h-12), `SkeletonStats` (3 angka). Spinner 16px hanya untuk aksi tombol (state isSubmitting).

### ErrorState
- Kartu border destructive/30 `bg-destructive-muted`, ikon TriangleAlert destructive, pesan 14px, tombol "Coba lagi" outline. Center, padding-y 48px.

### EmptyState
- Border-dashed `--color-border-strong`, radius 10px, padding-y 64px, ikon 28px faint, judul serif 18px ivory, deskripsi 14px muted max-w 40ch, CTA opsional (primary).

---

## 8. Interaksi & Motion

| Interaksi | Spesifikasi |
|---|---|
| Sidebar item aktif | Bar 2px gold fade-in 150ms + bg transition |
| Card hover | `translateY(-2px)` + border-color + shadow, 150ms ease-out; **hanya untuk kartu interactive** |
| Button press | `scale(0.98)` 100ms |
| Dialog | Overlay fade 150ms; panel fade+rise 200ms ease-out; exit 150ms |
| Dropdown | fade+scale 150ms, transform-origin top |
| Tabs indicator | underline translate 150ms |
| Skeleton | pulse opacity 1.5s infinite |
| Page transition | **Tidak ada transisi route penuh** — cukup konten main dengan `animation: fade-in 200ms` sekali saat mount (key = pathname) |
| Focus-visible | ring gold 2px offset 2px, semua elemen interaktif |

Global rule:
- Durasi: 100–200ms. Easing: `ease-out` masuk, `ease-in` keluar. Tidak ada spring/bounce.
- Properti yang dianimasikan: `opacity`, `transform`, `color`, `background-color`, `border-color` saja (murah, tanpa layout thrash).
- **`prefers-reduced-motion: reduce`** → semua transition/animation duration jadi 0.01ms (definisikan sekali di CSS global):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms; transition-duration: 0.01ms; }
  }
  ```

---

## 9. Responsive

| Breakpoint | Layout |
|---|---|
| ≥1280px | Sidebar 264px tetap, konten max-w 1120px, grid 3 kolom |
| 1024–1279px | Sama, grid universe 2 kolom |
| 768–1023px (tablet) | **Sidebar collapse jadi rail 64px** (ikon only, tooltip via title attr; group label disembunyikan) — alternatif lebih murah daripada drawer. Navbar penuh. Grid 2 kolom. |
| <768px (mobile) | Sidebar jadi **drawer**: tombol hamburger di navbar → panel overlay dari kiri (264px, `bg-surface`), backdrop `bg-black/60`, tutup saat navigate/backdrop/X. Auth: panel editorial kiri dibuang, form full-width padding 16px. Grid 1 kolom. Statistik dashboard jadi scroll-snap horizontal. Timeline: garis & node tetap kiri, konten full. Toolbar filter: search full-width, Select berjejer scrollable. |

Wajib: tidak ada overflow horizontal di semua breakpoint (uji cover strip & timeline date overline). Touch target min 44px di mobile untuk item nav & tombol.

---

## 10. Urutan Implementasi (disarankan)

1. **Fondasi token:** ganti `@theme` di `src/index.css` (palet gelap §2) + font weight + reduced-motion rule. Semua komponen existing langsung ikut berubah warna karena sudah pakai token.
2. **Primitives:** Badge, Skeleton (LoadingState refactor), Select (native), Update Button/Card/Dialog ke spesifikasi §7.
3. **Shell:** Sidebar baru (group WORKSPACE/WORLD BUILDING/ACCOUNT, indikator gold, universe switcher stub), Navbar dengan breadcrumb, PageHeader dengan overline.
4. **Halaman auth:** Login & Register (panel editorial + form; tambah konfirmasi password di schema).
5. **Dashboard** (statistik editorial + recent + quick actions).
6. **My Universes** (toolbar + kartu cover + empty) → **Create Universe** (form lengkap + dropzone visual).
7. **Universe Overview** (cover strip + quick nav) → **Encyclopedia** (toolbar + grid/list + dialog detail) → **Lore Editor** (toolbar rich text visual + tags + sticky footer).
8. **Timeline** (node diamond + era divider) → **Discover** (featured + grid publik).
9. **Polish:** state kosong semua halaman, skeleton di semua fetch, audit kontras & reduced-motion, uji 3 breakpoint.

Estimasi relatif: langkah 1–3 mengubah ~80% look dengan ~30% effort — kerjakan dulu sebelum sentuh halaman.

---

## Lampiran: mapping token → file

| Token baru | Ubah di |
|---|---|
| Palet gelap, `--color-surface/elevated/faint/secondary` | `src/index.css` `@theme` |
| Ring/focus, radius 10px card | `src/index.css` + class di `components/ui/*` |
| Skeleton, fade-in keyframe, reduced-motion | `src/index.css` (global) |
| Sidebar groups & indikator | `components/shared/sidebar.jsx` |
| Breadcrumb navbar | `components/shared/navbar.jsx` |
| Overline PageHeader | `components/shared/page-header.jsx` |
| Universe switcher (baru) | `components/shared/` + state universe di `hooks/` |

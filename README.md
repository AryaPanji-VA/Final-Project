# Tugas React Hooks

Playground sederhana berbasis React + Vite untuk belajar `useState`, `useEffect`, dan mengambil data. Tiga latihan di dalamnya sudah bisa dicoba langsung, sekaligus bisa dibaca sebagai contoh saat belajar.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka alamat lokal yang muncul di terminal. Untuk membuat production build, jalankan `npm run build`.

## Struktur proyek

```text
src/
  App.jsx                 Halaman utama dan navigasi latihan
  App.css                 Gaya halaman dan komponen
  index.css               Gaya global dan warna
  components/
    Counter.jsx           State angka dan tombol penghitung
    TodoList.jsx           Daftar tugas dengan input form
    DataFetcher.jsx        Effect dan permintaan data API
```

## Komponen latihan

- **Penghitung (Counter)** — tombol tambah, kurang, dan ulangi memakai `useState`.
- **Daftar tugas (TodoList)** — tambah tugas lewat tombol atau Enter, tandai selesai, dan hapus tugas.
- **Ambil data (DataFetcher)** — mengambil daftar pengguna dari JSONPlaceholder dengan `useEffect` dan `fetch`, serta menampilkan status loading, error, atau data.

## Catatan belajar

- Setter state meminta React menampilkan ulang komponen dengan nilai terbaru.
- Kalau nilai berikutnya bergantung pada nilai sebelumnya, gunakan bentuk updater, misalnya `setCount((angkaLama) => angkaLama + 1)`.
- Saat memperbarui array, buat array baru dengan `map`, `filter`, atau spread syntax. Hindari mengubah array lama secara langsung.
- Input terkontrol mengambil `value` dari state dan memperbarui state lewat `onChange`.
- Effect dengan `[]` berjalan setelah komponen pertama kali tampil. Fetch data termasuk side effect, jadi dilakukan di dalam effect, bukan saat render.
- Fetch menangani kegagalan jaringan dan respons HTTP yang tidak berhasil.
- Urutan belajar yang disarankan: **Counter → TodoList → DataFetcher**. Mulai dari satu nilai, lanjut ke array dan form, lalu pelajari proses async dan beberapa kondisi tampilan.

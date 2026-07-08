# Rebrand — 3 Langkah (tanpa coding)

Jadikan app ini brand milikmu dalam 3 langkah. Semua diatur dari 1 file: `config.js`.

## 1. Ganti nama & tagline
Buka `config.js`, edit 2 baris:
```js
nama: "Nama Brand-mu",
tagline: "Tagline singkat-mu",
```

## 2. Ganti logo
Timpa file `assets/logo.svg` dengan logo milikmu (format SVG, rasio kotak 1:1).
Logo muncul otomatis di pojok kiri atas sidebar + jadi favicon tab browser.
(Tidak punya SVG? Set `logo: "assets/logo.png"` di config.js dan taruh PNG-mu.)

## 3. Ganti warna aksen
Di `config.js` bagian `tema`, ubah nilai warna ke warna brand-mu:
```js
accent: "#34d399",
...
"--primary": "#34d399",       // warna aksen utama
"--primary-deep": "#059669",  // versi lebih gelap (hover)
```
Cukup ganti kode hex-nya. Aksen dipakai hemat (tombol utama, angka penting, status aktif).

---
Simpan, buka `index.html`. Selesai — app sudah ber-brand kamu.

**Catatan penting:**
- Semua data tersimpan lokal di perangkat pengguna (tanpa server, tanpa biaya).
- Fitur AI memakai API key Gemini **gratis** yang diisi tiap pengguna di menu **Pengaturan**. Jangan menanam key-mu di app yang di-deploy publik.
- App terisi **data contoh** agar langsung terlihat hidup. Pengguna bisa **Reset** atau **Kosongkan** lewat Pengaturan → Data demo.
- Deploy: dobel-klik `index.html`, atau seret folder ke https://app.netlify.com/drop untuk dapat link online gratis.

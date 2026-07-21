# Backend Form Kontak (Gmail SMTP)

Backend kecil pakai Express + Nodemailer yang mengirim isi form kontak
langsung ke inbox Gmail kamu.

## 1. Aktifkan App Password di akun Gmail

Gmail tidak lagi mengizinkan login pakai password biasa dari aplikasi luar,
jadi kamu perlu **App Password**:

1. Buka https://myaccount.google.com/security
2. Aktifkan **Verifikasi 2 Langkah (2-Step Verification)** dulu kalau belum aktif
3. Buka https://myaccount.google.com/apppasswords
4. Buat App Password baru (pilih nama bebas, misalnya "Website Kontak")
5. Google akan menampilkan kode 16 karakter — salin kode ini

## 2. Install & konfigurasi

```bash
npm install
cp .env.example .env
```

Buka `.env`, lalu isi:
- `GMAIL_USER` — alamat Gmail kamu
- `GMAIL_APP_PASSWORD` — kode 16 karakter dari langkah 1 (hapus semua spasi)
- `TO_EMAIL` — email tujuan pesan masuk (boleh sama dengan GMAIL_USER)

## 3. Jalankan

```bash
npm start
```

Kalau berhasil, akan muncul: `Terhubung ke Gmail, siap mengirim email.`

Tes lewat browser: buka `http://localhost:3000/api/health` — harus muncul
`{"ok":true,...}`.

## 4. Hubungkan ke halaman HTML

File `index.html` di folder website sudah diperbarui agar mengirim form
lewat `fetch()` ke `/api/kontak`. Ubah nilai `API_URL` di bagian bawah
`index.html` sesuai alamat backend kamu:

- Saat masih di komputer sendiri: `http://localhost:3000/api/kontak`
- Setelah backend online: `https://alamat-backend-kamu/api/kontak`

## 5. Cara deploy (hosting)

Hosting **shared hosting biasa (cPanel murah)** umumnya hanya untuk file statis
(HTML/CSS/PHP), **tidak otomatis bisa menjalankan Node.js** kecuali providernya
menyediakan fitur **"Setup Node.js App"** di cPanel. Kalau tersedia:

1. cPanel → **Setup Node.js App** → Create Application
2. Application root: folder tempat kamu upload `server.js`, `package.json`
3. Application startup file: `server.js`
4. Isi environment variables (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `TO_EMAIL`)
   lewat form yang disediakan cPanel — jangan upload file `.env` langsung
5. Klik **Run NPM Install**, lalu **Start App**

Kalau hosting kamu tidak punya fitur itu, alternatif gratis/murah yang
mendukung Node.js secara langsung: **Render**, **Railway**, atau **Vercel
(Serverless Functions)**. Deploy backend di sana, lalu arahkan `API_URL` di
`index.html` ke alamat backend tersebut — halaman HTML tetap bisa di-hosting
terpisah di cPanel murahmu.

## Keamanan

- Jangan pernah commit file `.env` ke repository publik
- App Password bisa dicabut kapan saja lewat halaman App Passwords Google
  kalau dicurigai bocor

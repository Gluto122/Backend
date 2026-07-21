require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();

// Daftar domain frontend yang diizinkan mengakses API ini
const allowedOrigins = [
  "https://mehdimf.my.id",
  "https://www.mehdimf.my.id",
];

app.use(cors({
  origin: function (origin, callback) {
    // origin bernilai undefined untuk request tanpa origin (misal Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Resend: mengirim email lewat API HTTP (bukan SMTP)
// SMTP Gmail diblokir di Render free tier, makanya pakai Resend sebagai gantinya.
// Daftar gratis di https://resend.com untuk mendapatkan RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend aktif.' });
});

app.post('/api/kontak', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Nama, email, dan pesan wajib diisi.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ ok: false, error: 'Format email tidak valid.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      // Selama domain kamu belum diverifikasi di Resend, pakai "onboarding@resend.dev".
      // Kalau sudah verifikasi domain sendiri, ganti jadi misal:
      // 'Form Kontak Website <kontak@mehdimf.my.id>'
      from: 'Form Kontak Website <onboarding@resend.dev>',
      to: process.env.TO_EMAIL,
      reply_to: email,
      subject: `Pesan baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: `
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Gagal mengirim email:', error);
      return res.status(500).json({ ok: false, error: 'Gagal mengirim pesan. Coba lagi nanti.' });
    }

    console.log('Email terkirim, id:', data?.id);
    res.json({ ok: true, message: 'Pesan berhasil dikirim!' });
  } catch (err) {
    console.error('Gagal mengirim email:', err.message);
    res.status(500).json({ ok: false, error: 'Gagal mengirim pesan. Coba lagi nanti.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

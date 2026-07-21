require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Transporter: mengirim email lewat akun Gmail menggunakan App Password
// (bukan password akun biasa — lihat README.md untuk cara membuatnya)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Cek koneksi ke Gmail saat server pertama kali jalan
transporter.verify((err) => {
  if (err) {
    console.error('Gagal terhubung ke Gmail:', err.message);
  } else {
    console.log('Terhubung ke Gmail, siap mengirim email.');
  }
});

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
    await transporter.sendMail({
      from: `"Form Kontak Website" <${process.env.GMAIL_USER}>`,
      to: process.env.TO_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Pesan baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: `
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ ok: true, message: 'Pesan berhasil dikirim!' });
  } catch (err) {
    console.error('Gagal mengirim email:', err.message);
    res.status(500).json({ ok: false, error: 'Gagal mengirim pesan. Coba lagi nanti.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

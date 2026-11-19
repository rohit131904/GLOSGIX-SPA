require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Only the public/ folder is exposed over HTTP (never the project root)
const PUBLIC_DIR = path.join(__dirname, 'public');

// /privacy.html -> /privacy (301), /index.html -> /
app.use((req, res, next) => {
  if (!req.path.endsWith('.html')) return next();
  const name = req.path.slice(1, -5);
  res.redirect(301, name === 'index' ? '/' : '/' + name);
});

// /privacy -> privacy.html, /terms -> terms.html
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// ---- ZeptoMail SMTP transport ----
// Configure in .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zeptomail.in', // use smtp.zeptomail.com for the .com region
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 = implicit TLS, 587/2525 = STARTTLS
  auth: {
    user: process.env.SMTP_USER, // usually "emailapikey"
    pass: process.env.SMTP_PASS  // ZeptoMail SMTP token
  }
});

// Escape user input before putting it into the HTML email
const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

app.post('/api/contact', async (req, res) => {
  const { name, email, phone } = req.body || {};

  if (!name || !email || !phone) {
    return res.status(400).json({ ok: false, error: 'Name, email and phone are all required.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `New Glogix demo request — ${String(name).replace(/[\r\n]+/g, ' ')}`,
      text: `New demo request from the Glogix website:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
      html: `
        <h2>New Glogix demo request</h2>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Phone:</b> ${esc(phone)}</p>
      `
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Mail send failed:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Glogix mail server running on port ${PORT}`));
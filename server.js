require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ---- ZeptoMail SMTP transport ----
// Fill these in your .env file (see .env.example)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zeptomail.in', // use smtp.zeptomail.com if your account is on the .com region
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for port 587 (STARTTLS), true if you switch to port 465
  auth: {
    user: process.env.SMTP_USER, // usually "emailapikey"
    pass: process.env.SMTP_PASS  // your ZeptoMail SMTP token
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone } = req.body || {};

  if (!name || !email || !phone) {
    return res.status(400).json({ ok: false, error: 'Name, email and phone are all required.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,        // e.g. '"Glogix Website" <no-reply@yourdomain.com>'
      to: process.env.MAIL_TO,            // e.g. 'rohit.joshi@xiarch.net'
      replyTo: email,
      subject: `New Glogix demo request — ${name}`,
      text: `New demo request from the Glogix website:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
      html: `
        <h2>New Glogix demo request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
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
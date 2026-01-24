const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// ===============================
// Nodemailer transporter (Brevo)
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // MUST be false for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
  connectionTimeout: 10000,
});

// ===============================
// Verify mail server on startup
// ===============================
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail server error:", error);
  } else {
    console.log("✅ Mail server ready (Contact)");
  }
});

// ===============================
// POST /api/contact
// ===============================
router.post("/", async (req, res) => {
  console.log("📩 Incoming contact data:", req.body);

  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "All fields are required.",
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // ✅ FIXED
      to: process.env.EMAIL_FROM,   // send to yourself
      subject: `[Contact Form] ${subject}`,
      text: `
New contact message:

Name: ${name}
Email: ${email}

Message:
${message}
      `,
      replyTo: email,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Email send error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to send email",
    });
  }
});

module.exports = router;

const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // must be false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});


// ✅ Verify transporter ON SERVER START
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail config error:", error);
  } else {
    console.log("✅ Mail server ready");
  }
});

// POST /api/contact
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
      from: process.env.EMAIL,          // sender (your email)
      to: process.env.EMAIL,            // restaurant owner email
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
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

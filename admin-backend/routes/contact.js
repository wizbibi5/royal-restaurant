const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// ===============================
// POST /api/contact (GMAIL SMTP)
// ===============================
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,       // your Gmail
        pass: process.env.EMAIL_PASS,  // app password
      },
    });

    await transporter.sendMail({
      from: `"Royal Restaurant" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error("❌ Email send error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

module.exports = router;

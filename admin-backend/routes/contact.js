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
    // Create transporter once per request
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,       // your Gmail
        pass: process.env.EMAIL_PASS,  // app password
      },
    });

    // Send email with a timeout wrapper
    const sendMailPromise = transporter.sendMail({
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

    // Optional: timeout after 15 seconds
    const result = await Promise.race([
      sendMailPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timed out")), 15000)
      ),
    ]);

    // If successful
    return res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error("❌ Email send error:", err.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
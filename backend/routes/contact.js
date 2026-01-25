const express = require("express");
require("dotenv").config();

const router = express.Router();

// ===============================
// POST /api/contact (Brevo API)
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
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Royal Restaurant",
          email: "dudicnijazija@gmail.com",
        },
        to: [
          {
            email: "dudicnijazija@gmail.com",
            name: "Royal Restaurant",
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `[Contact Form] ${subject}`,
        textContent: `
Name: ${name}
Email: ${email}

Message:
${message}
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Brevo API error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

module.exports = router;

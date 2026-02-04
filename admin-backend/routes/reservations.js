const express = require("express");
const Reservation = require("../models/Reservation");
const fetch = require("node-fetch"); // Make sure node-fetch is installed if Node < 18

const router = express.Router();

// ===============================
// POST /api/reservations (Brevo API)
// ===============================
router.post("/", async (req, res) => {
  const { fullName, email, phone, date, time, guests, message } = req.body;

  // Validate required fields
  if (!fullName || !email || !phone || !date || !time || !guests) {
    return res.status(400).json({
      success: false,
      error: "Please fill in all required fields",
    });
  }

  try {
    // Save reservation to MongoDB
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Send email via Brevo
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
          name: fullName,
        },
        subject: `[Reservation] ${fullName} - ${date} at ${time}`,
        textContent: `New reservation:\n
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${time}
Guests: ${guests}
Message: ${message || "None"}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Brevo returned error:", errorText);
      return res.status(500).json({
        success: false,
        error: "Failed to send reservation email",
      });
    }

    // Success
    res.status(200).json({
      success: true,
      message: "Reservation sent successfully!",
    });
  } catch (error) {
    console.error("❌ Reservation error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to send reservation",
    });
  }
});

module.exports = router;

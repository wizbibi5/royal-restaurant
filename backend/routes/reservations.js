const express = require("express");
const Reservation = require("../models/Reservation");
require("dotenv").config();

const router = express.Router();

// ===============================
// POST /api/reservations (Brevo API)
// ===============================
router.post("/", async (req, res) => {
  const { fullName, email, phone, date, time, guests, message } = req.body;

  if (!fullName || !email || !phone || !date || !time || !guests) {
    return res.status(400).json({
      success: false,
      error: "Please fill in all required fields",
    });
  }

  try {
    // Save reservation
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Send email
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
        textContent: `
New reservation:

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${time}
Guests: ${guests}
Message: ${message || "None"}
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

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

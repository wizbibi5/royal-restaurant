const express = require("express");
const Reservation = require("../models/Reservation");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// Nodemailer transporter — FIXED for Render
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // must be false for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
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

// POST /api/reservations
router.post("/", async (req, res) => {
  const { fullName, email, phone, date, time, guests, message } = req.body;

  // Basic validation
  if (!fullName || !email || !phone || !date || !time || !guests) {
    return res
      .status(400)
      .json({ success: false, error: "Please fill in all required fields." });
  }

  try {
    // Save to MongoDB
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Send email to restaurant
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL, // Restaurant owner's email
      subject: `[Reservation] ${fullName} - ${date} at ${time}`,
      text: `
New reservation:

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${time}
Guests: ${guests}
Message: ${message || "None"}
      `,
      replyTo: email,
    });

    res.status(200).json({ success: true, message: "Reservation sent successfully!" });
  } catch (error) {
    console.error("❌ Reservation error:", error);
    res.status(500).json({ success: false, error: "Failed to send reservation." });
  }
});

module.exports = router;


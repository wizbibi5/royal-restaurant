const express = require("express");
const Reservation = require("../models/Reservation");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// Nodemailer transporter — Brevo SMTP for Render
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // must be false for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER, // your Brevo SMTP login
    pass: process.env.BREVO_SMTP_PASS, // your Brevo SMTP key
  },
  connectionTimeout: 10000,
});

// ✅ Verify transporter on server start
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
    return res.status(400).json({
      success: false,
      error: "Please fill in all required fields.",
    });
  }

  try {
    // Save reservation to MongoDB
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Send email to restaurant
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,   // use verified sender from .env
      to: process.env.EMAIL_FROM,     // send to yourself / restaurant email
      subject: `[Reservation] ${fullName} - ${date} at ${time}`,
      text: `New reservation:

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${time}
Guests: ${guests}
Message: ${message || "None"}`,
      replyTo: email, // allows you to reply directly to the guest
    });

    res.status(200).json({
      success: true,
      message: "Reservation sent successfully!",
    });
  } catch (error) {
    console.error("❌ Reservation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send reservation.",
    });
  }
});

module.exports = router;

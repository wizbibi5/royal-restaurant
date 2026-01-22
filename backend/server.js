const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routes
const menuRoutes = require("./routes/menu");
const reservationRoutes = require("./routes/reservations");
const contactRoutes = require("./routes/contact");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// SERVE UPLOADED IMAGES
// ===============================
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// API routes
app.use("/api/menu", menuRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/contact", contactRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ===============================
// CLIENT HOME PAGE
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html")); // client
});

// ===============================
// ADMIN PAGE WITH SIMPLE PASSWORD CHECK
// ===============================
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "admin-login.html")); // show password form first
});

// POST endpoint to verify admin password
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ success: false, error: "Password required" });

  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, message: "Password correct" });
  } else {
    return res.status(401).json({ success: false, error: "Incorrect password" });
  }
});

// Fallback for frontend routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
  if (req.path.startsWith("/admin")) return res.status(404).send("Admin page not found");
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


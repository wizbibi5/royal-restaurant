const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// SAFE ROUTER LOADER
// ===============================
function loadRouter(routePath) {
  const router = require(routePath);

  if (typeof router !== "function") {
    console.error(`❌ INVALID ROUTER EXPORT: ${routePath}`);
    console.error("Export must be an Express router function.");
    process.exit(1);
  }

  return router;
}

// ===============================
// LOAD ROUTES
// ===============================
const menuRoutes = loadRouter("./routes/menu");
const reservationRoutes = loadRouter("./routes/reservations");
const contactRoutes = loadRouter("./routes/contact");

// ===============================
// SERVE UPLOADED IMAGES
// ===============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// SERVE ADMIN PANEL (STATIC)
// ===============================
const adminPublicPath = path.join(__dirname, "public");
app.use("/admin", express.static(adminPublicPath));

// ===============================
// SERVE PUBLIC SITE
// ===============================
const frontendPath = path.join(__dirname, "..", "public-site");
app.use(express.static(frontendPath));

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// ===============================
// API ROUTES
// ===============================
app.use("/api/menu", menuRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/contact", contactRoutes);

// ===============================
// ADMIN LOGIN
// ===============================
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: "Password required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, error: "Incorrect password" });
});

// ===============================
// ADMIN PAGES
// ===============================
app.get("/admin", (req, res) => {
  res.sendFile(path.join(adminPublicPath, "admin-login.html"));
});

app.get("/admin/admin.html", (req, res) => {
  res.sendFile(path.join(adminPublicPath, "admin.html"));
});

// ===============================
// ROOT
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ===============================
// FALLBACK
// ===============================
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

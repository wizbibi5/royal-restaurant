const express = require("express");
const MenuItem = require("../models/MenuItem");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===============================
// MULTER CONFIGURATION
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ===============================
// GET /api/menu - fetch all items
// ===============================
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("❌ Menu GET error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch menu items." });
  }
});

// ===============================
// POST /api/menu - create new item (admin)
// ===============================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ success: false, error: "Name, description, and price are required." });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      return res.status(400).json({ success: false, error: "Price must be a number." });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newItem = new MenuItem({ name, description, price: priceNum, category, image: imagePath });
    await newItem.save();

    res.status(201).json({ success: true, message: "Menu item added successfully!", data: newItem });
  } catch (error) {
    console.error("❌ Menu POST error:", error);
    res.status(500).json({ success: false, error: "Failed to add menu item." });
  }
});

// ===============================
// PATCH /api/menu/:id - update item (admin)
// ===============================
router.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.price) {
      const priceNum = parseFloat(updateData.price);
      if (!isNaN(priceNum)) updateData.price = priceNum;
      else delete updateData.price;
    }

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem) return res.status(404).json({ success: false, error: "Menu item not found." });

    res.status(200).json({ success: true, message: "Menu item updated successfully!", data: updatedItem });
  } catch (error) {
    console.error("❌ Menu PATCH error:", error);
    res.status(500).json({ success: false, error: "Failed to update menu item." });
  }
});

// ===============================
// PATCH /api/menu/:id/toggle-availability (admin)
// ===============================
router.patch("/:id/toggle-availability", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Menu item not found." });

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({ success: true, message: "Availability toggled!", data: item });
  } catch (error) {
    console.error("❌ Toggle availability error:", error);
    res.status(500).json({ success: false, error: "Failed to toggle availability." });
  }
});

// ===============================
// DELETE /api/menu/:id - delete item (admin)
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ success: false, error: "Menu item not found." });

    if (deletedItem.image) {
      const filePath = path.join(__dirname, "..", deletedItem.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "Menu item deleted successfully!" });
  } catch (error) {
    console.error("❌ Menu DELETE error:", error);
    res.status(500).json({ success: false, error: "Failed to delete menu item." });
  }
});

module.exports = router;

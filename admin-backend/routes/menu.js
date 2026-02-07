const express = require("express");
const MenuItem = require("../models/MenuItem");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

// ===============================
// SUPABASE CONFIG (SERVICE KEY)
// ===============================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // use service role key here
);
const bucketName = process.env.SUPABASE_BUCKET;

// ===============================
// MULTER (MEMORY STORAGE)
// ===============================
const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// GET /api/menu
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
// POST /api/menu (CREATE)
// ===============================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !req.file) {
      return res.status(400).json({
        success: false,
        error: "Name, description, price and image are required.",
      });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      return res.status(400).json({ success: false, error: "Price must be a number." });
    }

    // Upload image to Supabase
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ success: false, error: "Image upload failed." });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const newItem = new MenuItem({
      name,
      description,
      price: priceNum,
      category,
      image: publicUrlData.publicUrl,
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Menu item added successfully!",
      data: newItem,
    });
  } catch (error) {
    console.error("❌ Menu POST error:", error);
    res.status(500).json({ success: false, error: "Failed to add menu item." });
  }
});

// ===============================
// PATCH /api/menu/:id (UPDATE)
// ===============================
router.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.price) {
      const priceNum = parseFloat(updateData.price);
      if (!isNaN(priceNum)) updateData.price = priceNum;
      else delete updateData.price;
    }

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `menu/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        return res.status(500).json({ success: false, error: "Image upload failed." });
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      updateData.image = publicUrlData.publicUrl;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Menu item not found." });
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully!",
      data: updatedItem,
    });
  } catch (error) {
    console.error("❌ Menu PATCH error:", error);
    res.status(500).json({ success: false, error: "Failed to update menu item." });
  }
});

// ===============================
// DELETE /api/menu/:id
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: "Menu item not found." });
    }

    // Delete image from Supabase
    if (deletedItem.image) {
      try {
        const filePath = deletedItem.image.split("/").slice(-2).join("/"); // get path after bucket URL
        await supabase.storage.from(bucketName).remove([filePath]);
      } catch (err) {
        console.warn("⚠️ Failed to delete image from Supabase:", err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Menu DELETE error:", error);
    res.status(500).json({ success: false, error: "Failed to delete menu item." });
  }
});

module.exports = router;

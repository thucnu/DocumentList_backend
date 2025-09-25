const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");
const { verifyToken, isAdmin } = require("../src/middleware/auth");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Import file (admin only)
router.post(
  "/import",
  verifyToken,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const { group, name } = req.body;
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const file = req.file;
      const doc = new Document({
        name,
        group,
        path: file.path,
        originalName: file.originalname,
        owner: req.user.userId,
      });
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Lấy danh sách file, filter theo tên
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    const docs = await Document.find(query).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xem nội dung file (trả về file hoặc buffer)
router.get("/:id/view", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.resolve(doc.path));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa file và metadata (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    // Xóa file vật lý
    if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    await doc.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

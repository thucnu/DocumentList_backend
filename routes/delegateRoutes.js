const express = require("express");
const router = express.Router();
const delegateController = require("../controllers/delegateController");
const { verifyToken, isAdmin } = require("../src/middleware/auth");

// GET: lấy danh sách đại biểu, có thể search theo tên
router.get("/", delegateController.listDelegates);

// POST: import từ excel, chỉ admin
router.post(
  "/import",
  verifyToken,
  isAdmin,
  delegateController.importDelegates
);

// PUT: cập nhật đại biểu, chỉ admin
router.put("/:id", verifyToken, isAdmin, delegateController.updateDelegate);

// DELETE: xóa đại biểu, chỉ admin
router.delete("/:id", verifyToken, isAdmin, delegateController.deleteDelegate);

module.exports = router;

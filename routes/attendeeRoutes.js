const express = require("express");
const router = express.Router();
const attendeeController = require("../controllers/attendeeController");
const { verifyToken, isAdmin } = require("../src/middleware/auth");

// GET: lấy danh sách attendee, có thể search theo tên
router.get("/", attendeeController.listAttendees);

// POST: import từ excel, chỉ admin
router.post(
  "/import",
  verifyToken,
  isAdmin,
  attendeeController.importAttendees
);

// PUT: cập nhật attendee, chỉ admin
router.put("/:id", verifyToken, isAdmin, attendeeController.updateAttendee);

// DELETE: xóa attendee, chỉ admin
router.delete("/:id", verifyToken, isAdmin, attendeeController.deleteAttendee);

module.exports = router;

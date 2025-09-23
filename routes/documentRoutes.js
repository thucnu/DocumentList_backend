const express = require("express");
const router = express.Router();
const {
  createDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/documentController");
const auth = require("../src/middleware/auth");

router.post("/", auth, createDocument);
router.get("/", auth, getDocuments);
router.delete("/:id", auth, deleteDocument);

module.exports = router;

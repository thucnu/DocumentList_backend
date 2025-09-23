const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên tài liệu
  group: { type: String, required: true }, // Nhóm tài liệu
  path: { type: String, required: true }, // Đường dẫn file vật lý
  originalName: { type: String, required: true }, // Tên gốc khi upload
  createdAt: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người upload
});

module.exports = mongoose.model("Document", DocumentSchema);

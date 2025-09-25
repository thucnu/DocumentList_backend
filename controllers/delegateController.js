const Delegate = require("../models/Delegate");

// GET /api/delegates?name=...
exports.listDelegates = async (req, res) => {
  try {
    const { fullname } = req.query;
    let query = {};
    if (fullname) {
      query.fullname = { $regex: fullname, $options: "i" };
    }
    const delegates = await Delegate.find(query).sort({ stt: 1 });
    // Format birthDate to dd/MM/yyyy
    const formatted = delegates.map((d) => {
      let birthDate = "";
      if (d.birthDate instanceof Date && !isNaN(d.birthDate)) {
        const day = String(d.birthDate.getDate()).padStart(2, "0");
        const month = String(d.birthDate.getMonth() + 1).padStart(2, "0");
        const year = d.birthDate.getFullYear();
        birthDate = `${day}/${month}/${year}`;
      }
      return { ...d.toObject(), birthDate };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách đại biểu" });
  }
};

// POST /api/delegates/import
exports.importDelegates = async (req, res) => {
  try {
    const { delegates } = req.body;
    if (!Array.isArray(delegates))
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    // Parse birthDate string or Excel serial to Date
    const parsedDelegates = delegates.map((d) => {
      let birthDate = d.birthDate;
      if (birthDate) {
        if (typeof birthDate === "string") {
          birthDate = birthDate.trim();
          const match = birthDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (match) {
            const day = Number(match[1]);
            const month = Number(match[2]);
            const year = Number(match[3]);
            birthDate = new Date(year, month - 1, day);
          } else if (!isNaN(Number(birthDate))) {
            // Excel serial date
            const serial = Number(birthDate);
            const excelEpoch = new Date(1899, 11, 30);
            birthDate = new Date(
              excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
            );
          } else {
            birthDate = null;
          }
        } else if (typeof birthDate === "number") {
          const excelEpoch = new Date(1899, 11, 30);
          birthDate = new Date(
            excelEpoch.getTime() + birthDate * 24 * 60 * 60 * 1000
          );
        }
      }
      return { ...d, birthDate }; // Removed image from return
    });
    await Delegate.insertMany(parsedDelegates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi import đại biểu" });
  }
};

// PUT /api/delegates/:id
exports.updateDelegate = async (req, res) => {
  try {
    const { id } = req.params;
    await Delegate.findByIdAndUpdate(id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật đại biểu" });
  }
};

// DELETE /api/delegates/:id
exports.deleteDelegate = async (req, res) => {
  try {
    const { id } = req.params;
    await Delegate.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa đại biểu" });
  }
};

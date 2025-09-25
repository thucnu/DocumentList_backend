const Attendee = require("../models/Attendee");

// GET /api/attendees?full_name=...
exports.listAttendees = async (req, res) => {
  try {
    const { full_name } = req.query;
    let query = {};
    if (full_name) {
      const words = full_name.trim().split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        query.$and = words.map((w) => ({
          full_name: { $regex: w, $options: "i" },
        }));
      } else {
        query.full_name = { $regex: full_name.trim(), $options: "i" };
      }
    }
    const attendees = await Attendee.find(query).sort({ full_name: 1 });
    // Format date_of_birth to dd/MM/yyyy
    const formatted = attendees.map((d) => {
      let date_of_birth = "";
      if (d.date_of_birth instanceof Date && !isNaN(d.date_of_birth)) {
        const day = String(d.date_of_birth.getDate()).padStart(2, "0");
        const month = String(d.date_of_birth.getMonth() + 1).padStart(2, "0");
        const year = d.date_of_birth.getFullYear();
        date_of_birth = `${day}/${month}/${year}`;
      }
      return { ...d.toObject(), date_of_birth };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách tham dự viên" });
  }
};

// POST /api/attendees/import
exports.importAttendees = async (req, res) => {
  try {
    const { attendees } = req.body;
    if (!Array.isArray(attendees))
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    // Parse date_of_birth string or Excel serial to Date
    // Lấy danh sách tên từ file import
    const importNames = attendees
      .map((d) => (d.full_name || "").trim())
      .filter(Boolean);
    // Tìm các tên đã tồn tại trong DB
    const existed = await Attendee.find({
      full_name: { $in: importNames },
    }).select("full_name -_id");
    const existedNames = existed.map((e) => e.full_name);
    // Lọc ra các attendee không trùng tên
    const uniqueAttendees = attendees.filter(
      (d) => !existedNames.includes((d.full_name || "").trim())
    );
    const parsedAttendees = uniqueAttendees.map((d) => {
      let date_of_birth = d.date_of_birth;
      if (date_of_birth) {
        if (typeof date_of_birth === "string") {
          date_of_birth = date_of_birth.trim();
          const match = date_of_birth.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (match) {
            const day = Number(match[1]);
            const month = Number(match[2]);
            const year = Number(match[3]);
            date_of_birth = new Date(year, month - 1, day);
          } else if (!isNaN(Number(date_of_birth))) {
            // Excel serial date
            const serial = Number(date_of_birth);
            const excelEpoch = new Date(1899, 11, 30);
            date_of_birth = new Date(
              excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
            );
          } else {
            date_of_birth = null;
          }
        } else if (typeof date_of_birth === "number") {
          const excelEpoch = new Date(1899, 11, 30);
          date_of_birth = new Date(
            excelEpoch.getTime() + date_of_birth * 24 * 60 * 60 * 1000
          );
        }
      }
      return {
        full_name: d.full_name,
        date_of_birth,
        hometown: d.hometown,
        title: d.title,
        image_filename: d.image_filename,
        checked_in: d.checked_in === true ? true : false,
      };
    });
    let inserted = [];
    if (parsedAttendees.length > 0) {
      inserted = await Attendee.insertMany(parsedAttendees);
    }
    res.json({
      success: true,
      inserted: inserted.map((a) => a.full_name),
      duplicated: existedNames,
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi import tham dự viên" });
  }
};

// PUT /api/attendees/:id
exports.updateAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};
    const fields = [
      "full_name",
      "date_of_birth",
      "hometown",
      "title",
      "image_filename",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });
    // Parse date_of_birth if string
    if (typeof update.date_of_birth === "string") {
      const match = update.date_of_birth.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );
      if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);
        update.date_of_birth = new Date(year, month - 1, day);
      }
    }
    await Attendee.findByIdAndUpdate(id, update);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật tham dự viên" });
  }
};

// DELETE /api/attendees/:id
exports.deleteAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    await Attendee.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa tham dự viên" });
  }
};

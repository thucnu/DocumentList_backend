const mongoose = require("mongoose");

const AttendeeSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    hometown: { type: String },
    title: { type: String },
    image_filename: { type: String },
    checked_in: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendee", AttendeeSchema, "attendees");

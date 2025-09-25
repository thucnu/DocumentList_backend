const mongoose = require("mongoose");

const DelegateSchema = new mongoose.Schema(
  {
    stt: Number,
    fullname: String,
    birthDate: Date,
    address: String,
    position: String,
    // image: String, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delegate", DelegateSchema);

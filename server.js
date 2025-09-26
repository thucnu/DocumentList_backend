const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/documentRoutes"));
app.use("/api/attendees", require("./routes/attendeeRoutes"));

const buildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(buildPath));

app.get(/.*/, (req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
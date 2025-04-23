const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file

const app = express();

// ✅ Enable CORS securely
app.use(
  cors({
    origin: "https://college-schedule.vercel.app/", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Use MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  user: process.env.DB_USER || "3G2bG1qYkCCbVfX.root",
  password: process.env.DB_PASSWORD || "MV8oVLMcgoRUOMd9",
  database: process.env.DB_NAME || "college_db",
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Test Database Connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to the database.");
  connection.release();
});

// ✅ Serve 'user.html' on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user.html"));
});

// ✅ Fetch schedule based on filters (Year, Department, Section, Day)
app.get("/getSchedule", (req, res) => {
  console.log("📌 Incoming request:", req.query);

  const { year, department, section, day } = req.query;

  if (!year || !department || !section || !day) {
    console.log("❌ Missing parameters:", req.query);
    return res
      .status(400)
      .json({ error: "Parameters year, department, section, and day are required." });
  }

  const query = `
        SELECT year, department, section, timing, subject, faculty, room_no, day
        FROM schedules 
        WHERE year = ? AND department = ? AND section = ? AND day = ?;
    `;

  db.query(query, [year, department, section, day], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch schedule.", details: err.message });
    }

    if (result.length === 0) {
      console.log("⚠️ No schedule found:", { year, department, section, day });
      return res.status(404).json({ error: "No schedule found for the given parameters." });
    }

    console.log("✅ Schedule found:", result);
    res.status(200).json({ message: "✅ Schedule fetched successfully.", schedule: result });
  });
});

// ✅ Fetch all schedules
app.get("/getAllSchedules", (req, res) => {
  console.log("📌 Fetching all schedules");

  const query = "SELECT * FROM schedules";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching schedules:", err);
      return res.status(500).json({ error: "Failed to fetch schedules." });
    }

    console.log("✅ All schedules fetched:", result.length, "records");
    res.status(200).json({
      message: "✅ All schedules fetched successfully.",
      schedules: result,
    });
  });
});

// ✅ Start the server dynamically (useful for deployment)
const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "vercel") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// ✅ Export app for Vercel deployment
module.exports = app;

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* ============================= */
/* 🔥 MYSQL CONNECTION (IMPROVED) */
/* ============================= */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Pragnya#123",
  database: "burnout_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("✅ MySQL Pool Created");

/* ============================= */
/* STATIC FILES */
/* ============================= */
app.use(express.static(path.join(__dirname, "public")));

/* ============================= */
/* BASIC ROUTE */
/* ============================= */
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

/* ============================= */
/* STUDENTS */
/* ============================= */
app.post("/students", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO students (name, email) VALUES (?, ?)";

  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error inserting student" });
    }

    res.json({ message: "Student added", id: result.insertId });
  });
});

/* ============================= */
/* DAILY LOGS */
/* ============================= */
app.post("/logs", (req, res) => {
  const { student_id, study_hours, sleep_hours, mood } = req.body;

  const sql = `
    INSERT INTO daily_logs (student_id, date, study_hours, sleep_hours, mood)
    VALUES (?, CURDATE(), ?, ?, ?)
  `;

  db.query(sql, [student_id, study_hours, sleep_hours, mood], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error inserting log" });
    }

    res.json({ message: "Log added" });
  });
});

/* ============================= */
/* BURNOUT CHECK */
/* ============================= */
app.get("/burnout/:id", (req, res) => {
  const student_id = req.params.id;

  const sql = `
    SELECT sleep_hours FROM daily_logs
    WHERE student_id = ?
    ORDER BY date DESC
    LIMIT 3
  `;

  db.query(sql, [student_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error checking burnout" });
    }

    if (results.length < 3) {
      return res.json({ message: "Not enough data yet" });
    }

    const lowSleep = results.every(r => r.sleep_hours < 6);

    if (lowSleep) {
      res.json({ warning: "⚠️ Burnout Risk: Low sleep for 3 days" });
    } else {
      res.json({ message: "You are doing okay 👍" });
    }
  });
});

/* ============================= */
/* GET LOGS */
/* ============================= */
app.get("/logs/:id", (req, res) => {
  const student_id = req.params.id;

  const sql = "SELECT * FROM daily_logs WHERE student_id = ?";

  db.query(sql, [student_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error fetching logs" });
    }

    res.json(results);
  });
});

/* ============================= */
/* TIME BLOCKS (CORE FEATURE) */
/* ============================= */

/* ✅ CREATE BLOCK */
app.post("/time-blocks", (req, res) => {
  const {
    student_id,
    date,
    start_time,
    end_time,
    activity,
    focus_level,
    location   // 🔥 FIXED (was "place")
  } = req.body;

  /* 🔍 CHECK OVERLAP */
  const checkSql = `
    SELECT * FROM time_blocks
    WHERE student_id = ?
    AND date = ?
    AND (start_time < ? AND end_time > ?)
  `;

  db.query(checkSql, [student_id, date, end_time, start_time], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error checking overlap" });
    }

    if (results.length > 0) {
      return res.json({ error: "Time block overlaps with existing block" });
    }

    /* ✅ INSERT BLOCK */
    const insertSql = `
      INSERT INTO time_blocks
      (student_id, date, start_time, end_time, activity, focus_level, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [student_id, date, start_time, end_time, activity, focus_level, location],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Error inserting block" });
        }

        res.json({ message: "Block created", id: result.insertId });
      }
    );
  });
});

/* ✅ GET BLOCKS */
app.get("/time-blocks/:student_id/:date", (req, res) => {
  const { student_id, date } = req.params;

  const sql = `
    SELECT * FROM time_blocks
    WHERE student_id = ? AND date = ?
    ORDER BY start_time ASC
  `;

  db.query(sql, [student_id, date], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error fetching blocks" });
    }

    res.json(results);
  });
});

/* ============================= */
/* START SERVER */
/* ============================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
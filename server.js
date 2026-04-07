const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pragnya#123', // 👈 replace this
    database: 'burnout_tracker'
});

db.connect((err) => {
    if (err) {
        console.log("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// basic route
app.get('/', (req, res) => {
    res.send("Server is running 🚀");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.post('/students', (req, res) => {
    const { name, email } = req.body;

    const sql = "INSERT INTO students (name, email) VALUES (?, ?)";

    db.query(sql, [name, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error inserting student ❌");
        }
        res.send("Student added successfully ✅");
    });
});
app.post('/logs', (req, res) => {
    console.log(req.body);
    const { student_id, study_hours, sleep_hours, mood } = req.body;

    const sql = `
        INSERT INTO daily_logs (student_id, date, study_hours, sleep_hours, mood)
        VALUES (?, CURDATE(), ?, ?, ?)
    `;

    db.query(sql, [student_id, study_hours, sleep_hours, mood], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error inserting log ❌");
        }
        res.send("Log added successfully ✅");
    });
});
app.get('/burnout/:id', (req, res) => {
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
            return res.send("Error checking burnout ❌");
        }

        if (results.length < 3) {
            return res.send("Not enough data yet");
        }

        const lowSleep = results.every(r => r.sleep_hours < 6);

        if (lowSleep) {
            res.send("⚠️ Burnout Risk: Low sleep for 3 days");
        } else {
            res.send("You are doing okay 👍");
        }
    });
});
app.get('/logs/:id', (req, res) => {
    const student_id = req.params.id;

    const sql = "SELECT * FROM daily_logs WHERE student_id = ?";

    db.query(sql, [student_id], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error fetching logs ❌");
        }
        res.json(results);
    });
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.post('/time-blocks', (req, res) => {
    const {
        student_id,
        date,
        start_time,
        end_time,
        activity,
        focus_level,
        place
    } = req.body;

    // Step 1: Check for overlap
    const checkSql = `
        SELECT * FROM time_blocks
        WHERE student_id = ?
        AND date = ?
        AND (
            (start_time < ? AND end_time > ?)
        )
    `;

    db.query(checkSql, [student_id, date, end_time, start_time], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error checking overlap ❌");
        }

        if (results.length > 0) {
            return res.send("Time block overlaps with existing block ❌");
        }

        // Step 2: Insert if no overlap
        const insertSql = `
            INSERT INTO time_blocks
            (student_id, date, start_time, end_time, activity, focus_level, place)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [
            student_id,
            date,
            start_time,
            end_time,
            activity,
            focus_level,
            place
        ], (err, result) => {
            if (err) {
                console.log(err);
                return res.send("Error inserting block ❌");
            }

            res.send("Time block created successfully ✅");
        });
    });
});
app.get('/time-blocks/:student_id/:date', (req, res) => {
    const { student_id, date } = req.params;

    const sql = `
        SELECT * FROM time_blocks
        WHERE student_id = ? AND date = ?
        ORDER BY start_time ASC
    `;

    db.query(sql, [student_id, date], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error fetching blocks ❌");
        }

        res.json(results);
    });
});
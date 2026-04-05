const express = require('express');
const mysql = require('mysql2');

const app = express();
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

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // For serving static files

const app = express();

// Enable CORS for frontend access
app.use(cors({
    origin: '*', // Temporarily allow all (for debugging)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Use MySQL Connection Pool (Prevents connection leaks)
const db = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '3G2bG1qYkCCbVfX.root', // ✅ Ensure the correct prefix
    password: 'MV8oVLMcgoRUOMd9',
    database: 'college_db',
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10, // ✅ Pool limit (adjust based on traffic)
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to the database.');
    connection.release(); // Release connection after test
});

// Serve 'user.html' when accessing the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Fetch schedule based on filters (Year, Department, Section, Day)
app.get('/getSchedule', (req, res) => {
    console.log('📌 Incoming request:', req.query);

    const { year, department, section, day } = req.query;

    if (!year || !department || !section || !day) {
        console.log('❌ Missing parameters:', req.query);
        return res.status(400).json({ error: 'Parameters year, department, section, and day are required.' });
    }

    const query = `
        SELECT year, department, section, timing, subject, faculty, room_no, day
        FROM schedules 
        WHERE year = ? AND department = ? AND section = ? AND day = ?;
    `;

    db.query(query, [year, department, section, day], (err, result) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch schedule.', details: err.message });
        }

        if (result.length === 0) {
            console.log('⚠️ No schedule found:', { year, department, section, day });
            return res.status(404).json({ error: 'No schedule found for the given parameters.' });
        }

        console.log('✅ Schedule found:', result);
        res.status(200).json({ message: '✅ Schedule fetched successfully.', schedule: result });
    });
});

// Fetch all schedules
app.get('/getAllSchedules', (req, res) => {
    console.log('📌 Fetching all schedules');

    const query = 'SELECT * FROM schedules';

    db.query(query, (err, result) => {
        if (err) {
            console.error('❌ Error fetching schedules:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules.' });
        }

        console.log('✅ All schedules fetched:', result.length, 'records');
        res.status(200).json({
            message: '✅ All schedules fetched successfully.',
            schedules: result,
        });
    });
});

// Start the server
const port = 4000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});

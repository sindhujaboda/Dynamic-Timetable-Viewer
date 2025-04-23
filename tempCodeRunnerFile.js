const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // For serving static files


const app = express();
app.use(cors({
    origin: 'http://localhost:3000' // Replace with the actual frontend URL if different
}));

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bk071204@',  // Use your MySQL password
    database: 'college_db',
    port: 5000  // Make sure it's the correct port
});


db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Serve 'user.html' when accessing the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Fetch schedule based on basic filters (Year, Department, Section, Day)
app.get('/getSchedule', (req, res) => {
    const { year, department, section, day } = req.query;

    // Validate the query parameters
    if (!year || !department || !section || !day) {
        return res.status(400).json({ error: 'Parameters year, department, section, and day are required.' });
    }

    // SQL query to fetch schedule with all attributes
    const query = `
        SELECT year, department, section, timing, subject, faculty, room_no, day
        FROM schedules 
        WHERE year = ? AND department = ? AND section = ? AND day = ?;
    `;

    // Log query parameters for debugging
    console.log('Fetching schedule with params:', { year, department, section, day });

    db.query(query, [year, department, section, day], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log database error
            return res.status(500).json({ error: 'Failed to fetch schedule.', details: err.message });
        }

        if (result.length === 0) {
            console.log('No schedule found:', { year, department, section, day }); // Log no results
            return res.status(404).json({ error: 'No schedule found for the given parameters.' });
        }

        res.status(200).json({ message: 'Schedule fetched successfully.', schedule: result });
    });
});

// Fetch all schedules
app.get('/getAllSchedules', (req, res) => {
    const query = 'SELECT * FROM schedules';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching schedules:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules.' });
        }

        res.status(200).json({
            message: 'All schedules fetched successfully.',
            schedules: result, // Includes all rows and their attributes
        });
    });
});

// Start the server
const port = 3306;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

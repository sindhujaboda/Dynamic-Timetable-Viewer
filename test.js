const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '3G2bG1qYkCCbVfX.root', // Ensure this includes the correct prefix
    password: 'MV8oVLMcgoRUOMd9',
    database: 'college_db',
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    }
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to the database.');

    // Test query: Fetch first 5 rows from 'schedules' table
    const testQuery = 'SELECT * FROM schedules LIMIT 5';

    db.query(testQuery, (err, results) => {
        if (err) {
            console.error('Query failed:', err.message);
            return;
        }

        console.log('Retrieved Data:', results);

        // Close connection after query
        db.end();
    });
});

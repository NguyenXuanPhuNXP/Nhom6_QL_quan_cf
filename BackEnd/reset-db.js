const mysql = require('mysql2');

// Create connection without database first
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL');

    // Drop and recreate database
    connection.query('DROP DATABASE IF EXISTS quanlycaphe', (err) => {
        if (err) {
            console.error('❌ Error dropping database:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log('✅ Dropped old database');

        connection.end();
        
        // Now run setup-db
        require('./setup-db.js');
    });
});

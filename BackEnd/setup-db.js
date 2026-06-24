const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Read schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

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

    // Drop old database first
    connection.query('DROP DATABASE IF EXISTS quanlycaphe', (dropErr) => {
        if (dropErr) {
            console.log('ℹ️  Database may not exist yet, continuing...');
        } else {
            console.log('✅ Dropped old database');
        }

        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        let completed = 0;
        const total = statements.length;

        statements.forEach((statement, index) => {
            connection.query(statement, (err, results) => {
                if (err) {
                    console.error(`❌ Error executing statement ${index + 1}:`, err.message);
                } else {
                    console.log(`✅ Statement ${index + 1}/${total} executed`);
                }
                completed++;

                // Close connection when all statements are done
                if (completed === total) {
                    connection.end();
                    console.log('\n✅ Database setup completed!');
                    process.exit(0);
                }
            });
        });
    });
});

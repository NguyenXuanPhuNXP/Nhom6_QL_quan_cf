const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'quanlycaphe'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL');

    // Check if payroll table exists
    const checkTable = `
        SELECT COUNT(*) as count FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'quanlycaphe' AND TABLE_NAME = 'payroll'
    `;

    connection.query(checkTable, (err, results) => {
        if (err) {
            console.error('❌ Error checking table:', err.message);
            connection.end();
            process.exit(1);
        }

        if (results[0].count === 0) {
            // Create payroll table if it doesn't exist
            const createPayrollTable = `
                CREATE TABLE IF NOT EXISTS payroll (
                    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
                    employee_id INT NOT NULL,
                    month INT NOT NULL,
                    year INT NOT NULL,
                    total_hours DECIMAL(8, 2) DEFAULT 0,
                    base_salary DECIMAL(15, 2) DEFAULT 0,
                    bonus DECIMAL(15, 2) DEFAULT 0,
                    penalty DECIMAL(15, 2) DEFAULT 0,
                    total_salary DECIMAL(15, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
                    UNIQUE KEY unique_payroll (employee_id, month, year)
                )
            `;

            connection.query(createPayrollTable, (err) => {
                if (err) {
                    console.error('❌ Error creating payroll table:', err.message);
                    connection.end();
                    process.exit(1);
                }
                console.log('✅ Payroll table created');
                
                // Insert sample data
                insertSampleData();
            });
        } else {
            console.log('✅ Payroll table already exists');
            
            // Check if base_salary column exists
            const checkColumn = `
                SELECT COUNT(*) as count FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = 'quanlycaphe' AND TABLE_NAME = 'payroll' AND COLUMN_NAME = 'base_salary'
            `;

            connection.query(checkColumn, (err, results) => {
                if (err) {
                    console.error('❌ Error checking column:', err.message);
                    connection.end();
                    process.exit(1);
                }

                if (results[0].count === 0) {
                    // Add base_salary column if it doesn't exist
                    const addColumn = `
                        ALTER TABLE payroll ADD COLUMN base_salary DECIMAL(15, 2) DEFAULT 0 AFTER total_hours
                    `;

                    connection.query(addColumn, (err) => {
                        if (err) {
                            console.error('❌ Error adding base_salary column:', err.message);
                            connection.end();
                            process.exit(1);
                        }
                        console.log('✅ Added base_salary column to payroll table');
                        connection.end();
                        console.log('\n✅ Database update completed!');
                        process.exit(0);
                    });
                } else {
                    console.log('✅ base_salary column already exists');
                    connection.end();
                    console.log('\n✅ Database is up to date!');
                    process.exit(0);
                }
            });
        }
    });

    function insertSampleData() {
        const insertSampleData = `
            INSERT IGNORE INTO payroll (employee_id, month, year, total_hours, base_salary, bonus, penalty, total_salary) VALUES
            (1, 6, 2026, 176, 6600000, 500000, 0, 7100000),
            (1, 5, 2026, 180, 6750000, 300000, 100000, 6950000),
            (1, 4, 2026, 172, 6450000, 400000, 0, 6850000)
        `;

        connection.query(insertSampleData, (err) => {
            if (err) {
                console.error('❌ Error inserting sample data:', err.message);
                connection.end();
                process.exit(1);
            }
            console.log('✅ Sample payroll data inserted/verified');
            connection.end();
            console.log('\n✅ Payroll database setup completed!');
            process.exit(0);
        });
    }
});

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

    const createPayrollTable = `
        CREATE TABLE IF NOT EXISTS payroll (
            payroll_id INT PRIMARY KEY AUTO_INCREMENT,
            employee_id INT NOT NULL,
            month INT NOT NULL,
            year INT NOT NULL,
            total_hours DECIMAL(8, 2) DEFAULT 0,
            bonus DECIMAL(15, 2) DEFAULT 0,
            penalty DECIMAL(15, 2) DEFAULT 0,
            total_salary DECIMAL(15, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
            UNIQUE KEY unique_payroll (employee_id, month, year)
        )
    `;

    connection.query(createPayrollTable, (err, results) => {
        if (err) {
            console.error('❌ Error creating payroll table:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log('✅ Payroll table created/verified');

        // Insert sample payroll data
        const insertSampleData = `
            INSERT IGNORE INTO payroll (employee_id, month, year, total_hours, bonus, penalty, total_salary) VALUES
            (1, 6, 2026, 176, 500000, 0, 6660000),
            (1, 5, 2026, 180, 300000, 100000, 5600000),
            (1, 4, 2026, 172, 400000, 0, 6420000)
        `;

        connection.query(insertSampleData, (err, results) => {
            if (err) {
                console.error('❌ Error inserting sample data:', err.message);
                connection.end();
                process.exit(1);
            }
            console.log('✅ Sample payroll data inserted');
            connection.end();
            console.log('\n✅ Payroll setup completed!');
            process.exit(0);
        });
    });
});

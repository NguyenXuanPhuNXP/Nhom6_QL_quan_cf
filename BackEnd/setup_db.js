const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  try {
    // Generate correct hashes
    const adminHash = await new Promise((resolve, reject) => {
      bcrypt.hash('admin123', 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    const testHash = await new Promise((resolve, reject) => {
      bcrypt.hash('test123', 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    console.log('Admin hash:', adminHash);
    console.log('Test hash:', testHash);

    // Update admin user password
    db.query(
      'UPDATE users SET password_hashed = ? WHERE username = ?',
      [adminHash, 'admin'],
      (err, result) => {
        if (err) {
          console.error('Error updating admin:', err);
        } else {
          console.log('Admin user updated with correct password hash');
        }
      }
    );

    // Insert test user if not exists
    db.query(
      'INSERT IGNORE INTO users (username, password_hashed, role, employee_id, is_active) VALUES (?, ?, ?, ?, ?)',
      ['testuser', testHash, 'user', 999, 1],
      (err, result) => {
        if (err) {
          console.error('Error inserting testuser:', err);
        } else {
          console.log('Test user inserted');
        }
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setupDatabase();

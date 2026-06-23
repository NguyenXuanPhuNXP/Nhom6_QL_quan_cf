const db = require('./src/config/db');

async function test() {
  try {
    const username = 'testuser999';
    const [positions] = await db.execute('SELECT position_id FROM positions LIMIT 1');
    const positionId = positions.length > 0 ? positions[0].position_id : 1;
    console.log('Position ID:', positionId);

    const [employeeResult] = await db.execute(
        `INSERT INTO employee (full_name, phone, address, position_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        ['Test User', '123456', '123 St', positionId]
    );
    const employeeId = employeeResult.insertId;
    console.log('Employee ID:', employeeId);

    const [roles] = await db.execute('SELECT role_id FROM role WHERE role_name = ?', ['Staff']);
    console.log('Roles:', roles);

    console.log('Done');
    process.exit(0);
  } catch(e) {
    console.error('ERROR:', e);
    process.exit(1);
  }
}
test();

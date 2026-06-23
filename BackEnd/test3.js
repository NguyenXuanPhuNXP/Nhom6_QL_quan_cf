const db = require('./src/config/db');

async function test() {
    const [roles] = await db.execute('SELECT * FROM role');
    console.log(roles);
    process.exit(0);
}
test();

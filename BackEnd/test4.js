const db = require('./src/config/db');

async function test() {
    try {
        const [desc] = await db.execute('DESCRIBE employee');
        console.log(desc);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
test();

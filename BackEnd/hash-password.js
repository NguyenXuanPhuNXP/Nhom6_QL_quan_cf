const bcrypt = require('bcryptjs');

const password = '123456';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing:', err);
        process.exit(1);
    }
    console.log('Bcrypt hash of "123456":');
    console.log(hash);
    process.exit(0);
});

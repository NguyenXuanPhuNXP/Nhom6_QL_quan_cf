const authController = require('./src/controllers/authController');

const req = {
    body: {
        username: 'testuser_abc_3',
        password: 'password123',
        confirmPassword: 'password123',
        full_name: 'Test User 3',
        phone: '1234567892',
        address: '123 Test St'
    }
};

const res = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('Status:', this.statusCode);
        console.log('Data:', data);
    }
};

async function test() {
    await authController.register(req, res);
    process.exit(0);
}
test();

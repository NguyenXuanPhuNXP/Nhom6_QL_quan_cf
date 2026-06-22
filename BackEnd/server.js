const express = require('express');
const app = express();

const PORT = 3000;

// Middleware đọc JSON
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello ExpressJS!');
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
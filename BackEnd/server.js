const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const positionRoutes = require('./src/routes/positionRoutes');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello ExpressJS!');
});

// Auth routes
app.use('/auth', authRoutes);

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/positions', positionRoutes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
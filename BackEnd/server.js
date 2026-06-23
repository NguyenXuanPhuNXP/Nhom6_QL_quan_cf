const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello ExpressJS!');
});

// Auth routes (Also handles employees per Develop branch structure)
app.use('/auth', authRoutes);

// API routes
app.use('/api/accounts', accountRoutes);
app.use('/api/schedules', scheduleRoutes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
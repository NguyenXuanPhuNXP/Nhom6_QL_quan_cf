const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './src/.env' });
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const positionRoutes = require('./src/routes/positionRoutes');

const accountRoutes = require('./src/routes/accountRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const leaveRequestRoutes = require('./src/routes/leaveRequestRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const { initSocket } = require('./src/socket');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
    res.send('Hello ExpressJS!');
});

app.use('/api/accounts', accountRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
// Auth routes
app.use('/auth', authRoutes);

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/positions', positionRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
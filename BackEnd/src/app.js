const express = require('express');

const app = express();

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));

app.listen(3000, () => {
    console.log('Server running...');
});
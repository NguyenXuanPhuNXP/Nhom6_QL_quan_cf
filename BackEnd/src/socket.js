const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { setIO } = require('./services/notificationService');

const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Unauthorized'));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'my_super_secret_key'
            );

            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        const employeeId = socket.user.employee_id;
        socket.join(`employee_${employeeId}`);

        socket.on('disconnect', () => {});
    });

    setIO(io);
    return io;
};

module.exports = { initSocket };

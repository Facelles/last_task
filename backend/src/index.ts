import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import prisma from './config/prisma';

import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true, 
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

(async () => {
    try {
        await prisma.$connect();
        console.log('DB connected with Prisma');

        console.log('Prisma client ready');
    } catch (err) {
        console.error('DB connection error:', err);
    }
})();

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

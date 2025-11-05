import { Router, Request, Response } from 'express';
import { adminMiddleware, authMiddleware } from '../middleware/auth';
import prisma from '../config/prisma';


const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
    const { room_id, user_id, start_time, end_time, description } = req.body;
    const currentUser = req.user!;

    console.log('Create booking request:', { room_id, user_id, start_time, end_time, description });

    if (!room_id || !start_time || !end_time) {
        return res.status(400).json({ message: 'room_id, start_time, and end_time are required' });
    }

    const bookingUserId = user_id || currentUser.id;

    if (user_id && user_id !== currentUser.id && currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can create bookings for other users' });
    }

    try {
        const conflict = await prisma.booking.findFirst({
            where: {
                roomId: room_id,
                OR: [
                    {
                        startTime: { 
                            gte: new Date(start_time),
                            lte: new Date(end_time)
                        }
                    },
                    {
                        endTime: { 
                            gte: new Date(start_time),
                            lte: new Date(end_time)
                        }
                    },
                    {
                        startTime: { lte: new Date(start_time) },
                        endTime: { gte: new Date(end_time) }
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({ message: 'Room is already booked for this time' });
        }

        const booking = await prisma.booking.create({
            data: {
                roomId: room_id,
                userId: bookingUserId,
                startTime: new Date(start_time),
                endTime: new Date(end_time),
                description
            },
            include: {
                room: true,
                user: { select: { id: true, username: true, email: true, role: true } }
            }
        });

        res.status(201).json(booking)
    } catch (e) {
        console.error('Booking creation error:', e);
        res.status(500).json({ message: 'Error creating booking', error: e });
    }
});

router.get('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const booking = await prisma.booking.findMany({
            include: {
                room: true,
                user: { select: { id: true, username: true, email: true, role: true } }
            },
            orderBy: [{ startTime: 'desc' }]
        });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching bookings', error: e });
    }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const booking = await prisma.booking.findUnique({ 
            where: { id: parseInt(req.params.id) },
            include: {
                room: true,
                user: { select: { id: true, username: true, email: true, role: true } }
            }
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching bookings', error: e });
    }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!;
    const { startTime, endTime, description } = req.body;

    try {
        const booking = await prisma.booking.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (user.role !== 'admin' && booking.userId !== user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const conflict = await prisma.booking.findFirst({
            where: {
                roomId: booking.roomId,
                id: { not: booking.id },
                OR: [
                    { 
                        startTime: { 
                            gte: new Date(startTime),
                            lte: new Date(endTime)
                        }
                    },
                    { 
                        endTime: { 
                            gte: new Date(startTime),
                            lte: new Date(endTime)
                        }
                    },
                    { 
                        startTime: { lte: new Date(startTime) }, 
                        endTime: { gte: new Date(endTime) } 
                    }
                ]
            }
        });

        if (conflict) return res.status(400).json({ message: 'Room is already booked for this time' });

        const updatedBooking = await prisma.booking.update({
            where: { id: parseInt(req.params.id) },
            data: { 
                startTime: new Date(startTime), 
                endTime: new Date(endTime), 
                description 
            },
            include: {
                room: true,
                user: { select: { id: true, username: true, email: true, role: true } }
            }
        });
        res.json(updatedBooking);
    } catch (e) {
        res.status(500).json({ message: 'Error updating booking', error: e });
    }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!;
    try {
        const booking = await prisma.booking.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (user.role !== 'admin' && booking.userId !== user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (user.role !== 'admin') {
            const now = new Date();
            const bookingStart = new Date(booking.startTime);
            
            if (bookingStart <= now) {
                return res.status(400).json({ message: 'Cannot cancel past or ongoing bookings' });
            }
        }

        await prisma.booking.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Booking cancelled successfully' });
    } catch (e) {
        console.error('Error cancelling booking:', e);
        res.status(500).json({ message: 'Error cancelling booking', error: e });
    }
});

export default router;
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

router.get('/:id/bookings', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!;
    const userId = parseInt(req.params.id);
    if (user.role !== 'admin' && user.id !== userId) {
        return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    try {
        const now = new Date();
        
        const bookings = await prisma.booking.findMany({
            where: {
                userId: userId,
                startTime: { gt: now } 
            },
            include: {
                room: true,
                user: { select: { id: true, username: true, email: true, role: true } }
            },
            orderBy: [{ startTime: 'asc' }]
        });

        res.json(bookings);
    } catch (e) {
        console.error('Error fetching user bookings:', e);
        res.status(500).json({ message: 'Error fetching user bookings', error: e });
    }
});

export default router;
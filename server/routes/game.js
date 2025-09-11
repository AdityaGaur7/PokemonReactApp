import express from 'express';
import GameSession from '../schema/GameSession.js';

const router = express.Router();

router.post('/create-room', async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        if (!roomId || !userId) return res.status(400).json({ message: 'Missing fields' });
        const existing = await GameSession.findOne({ roomId });
        if (existing) return res.status(409).json({ message: 'Room already exists' });
        const session = await GameSession.create({
            roomId,
            players: [{ id: userId }],
            status: 'waiting',
        });
        res.status(201).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/join-room', async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        const session = await GameSession.findOne({ roomId });
        if (!session) return res.status(404).json({ message: 'Room not found' });
        if (session.players.length >= 2) return res.status(409).json({ message: 'Room full' });
        if (!session.players.find((p) => String(p.id) === String(userId))) {
            session.players.push({ id: userId });
        }
        await session.save();
        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// find-match handled via sockets; provide endpoint as stub if needed
router.post('/find-match', (req, res) => {
    res.json({ message: 'Use socket.io findMatch event' });
});

export default router;



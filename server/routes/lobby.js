/* eslint-env node */
import express from 'express';
import User from '../schema/User.js';

const router = express.Router();

router.get('/online', async (req, res) => {
    try {
        const users = await User.find({ socketId: { $ne: null } }).select('username wins losses');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;



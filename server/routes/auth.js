import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../schema/User.js';
import dotenv from 'dotenv/config';


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username already taken' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hash });
        return res.status(201).json({ id: user._id, username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'devsecret', {
            expiresIn: '7d',
        });
        return res.json({ token, user: { id: user._id, username: user.username, wins: user.wins, losses: user.losses } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;



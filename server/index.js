/* eslint-env node */
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';

import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import lobbyRoutes from './routes/lobby.js';
import gameRoutes from './routes/game.js';
import { attachSocketHandlers } from './sockets.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lobby', lobbyRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Socket.io
attachSocketHandlers(io);

// DB and server start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pokemon-battle';
const PORT = process.env.PORT || 4000;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error', err);
        process.exit(1);
    });



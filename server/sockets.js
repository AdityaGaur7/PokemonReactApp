import axios from 'axios';
import GameSession from './schema/GameSession.js';
import User from './schema/User.js';

const matchmakingQueue = [];

async function fetchRandomTeam(teamSize) {
    const ids = new Set();
    while (ids.size < teamSize) {
        ids.add(Math.floor(Math.random() * 151) + 1);
    }
    const team = [];
    for (const id of ids) {
        const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const stats = Object.fromEntries(data.stats.map((s) => [s.stat.name, s.base_stat]));
        team.push({
            id: data.id,
            name: data.name,
            baseStats: {
                hp: stats.hp,
                attack: stats.attack,
                defense: stats.defense,
            },
            currentHp: stats.hp,
            types: data.types.map((t) => t.type.name),
        });
    }
    return team;
}

function calculateDamage(attacker, defender) {
    const attack = Number(attacker?.baseStats?.attack ?? 0);
    const defense = Number(defender?.baseStats?.defense ?? 0);
    const raw = attack - defense;
    if (!Number.isFinite(raw)) return 1;
    return Math.max(1, Math.round(raw));
}

function getOpponentIndex(turnIndex) {
    return turnIndex === 0 ? 1 : 0;
}

function serializeSession(session) {
    return {
        roomId: session.roomId,
        status: session.status,
        turn: session.turn,
        players: session.players.map((p) => ({
            id: String(p.id),
            activeIndex: p.activeIndex,
            team: p.team.map((pk) => ({
                id: pk.id,
                name: pk.name,
                currentHp: pk.currentHp,
                baseStats: pk.baseStats,
                types: pk.types,
            })),
        })),
        winner: session.winner ? String(session.winner) : null,
    };
}

function getFirstAliveIndex(team) {
    if (!Array.isArray(team)) return 0;
    const idx = team.findIndex((p) => p && p.currentHp > 0);
    return idx === -1 ? 0 : idx;
}

export function attachSocketHandlers(io) {
    io.on('connection', async (socket) => {
        const { userId } = socket.handshake.query;
        if (userId) {
            await User.findByIdAndUpdate(userId, { socketId: socket.id });
        }

        socket.on('disconnect', async () => {
            if (userId) {
                await User.findByIdAndUpdate(userId, { socketId: null });
            }
        });

        socket.on('joinLobby', async () => {
            socket.join('lobby');
            const users = await User.find({ socketId: { $ne: null } }).select('username wins losses');
            io.to('lobby').emit('updateLobby', users);
        });

        socket.on('findMatch', async ({ userId }) => {
            matchmakingQueue.push({ socketId: socket.id, userId });
            if (matchmakingQueue.length >= 2) {
                const a = matchmakingQueue.shift();
                const b = matchmakingQueue.shift();
                const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                await GameSession.create({
                    roomId,
                    players: [{ id: a.userId }, { id: b.userId }],
                    status: 'waiting',
                    turn: 0,
                });

                io.to(a.socketId).emit('matchFound', { roomId });
                io.to(b.socketId).emit('matchFound', { roomId });
            }
        });

        socket.on('joinRoom', async ({ roomId }) => {
            socket.join(roomId);
            const session = await GameSession.findOne({ roomId });
            if (session) {
                io.to(roomId).emit('updateGame', serializeSession(session));
            }
        });

        socket.on('playerReady', async ({ roomId, userId }) => {
            const session = await GameSession.findOne({ roomId });
            if (!session) return;
            const playerIndex = session.players.findIndex((p) => String(p.id) === String(userId));
            if (playerIndex === -1) return;
            const player = session.players[playerIndex];
            if (!player.team || player.team.length === 0) {
                player.team = await fetchRandomTeam(6);
            }
            player.ready = true;
            // Ensure opponent has a team too so both sides show immediately
            const opponentIndex = getOpponentIndex(playerIndex);
            const opponent = session.players[opponentIndex];
            if (opponent && (!opponent.team || opponent.team.length === 0)) {
                opponent.team = await fetchRandomTeam(6);
            }
            // Normalize active indices to first alive
            session.players.forEach((p) => {
                p.activeIndex = getFirstAliveIndex(p.team);
            });
            if (session.players.every((p) => p.ready)) {
                session.status = 'in_progress';
            }
            await GameSession.updateOne({ _id: session._id }, {
                $set: {
                    players: session.players,
                    status: session.status,
                },
            });
            const latest = await GameSession.findOne({ roomId });
            io.to(roomId).emit('updateGame', serializeSession(latest));
        });

        socket.on('playTurn', async ({ roomId, userId, activeIndex, action }) => {
            const session = await GameSession.findOne({ roomId });
            if (!session || session.status !== 'in_progress') return;
            const currentIndex = session.turn;
            const current = session.players[currentIndex];
            if (String(current.id) !== String(userId)) return; // not your turn
            // Handle switching (consumes turn)
            if (action === 'switch') {
                if (typeof activeIndex === 'number' && current.team[activeIndex] && current.team[activeIndex].currentHp > 0) {
                    current.activeIndex = activeIndex;
                } else {
                    current.activeIndex = getFirstAliveIndex(current.team);
                }
                const opponentIndex = getOpponentIndex(currentIndex);
                await GameSession.updateOne({ _id: session._id }, {
                    $set: {
                        players: session.players,
                        status: session.status,
                        winner: session.winner ?? null,
                        turn: opponentIndex,
                    },
                });
                const latestSwitch = await GameSession.findOne({ roomId });
                io.to(roomId).emit('updateGame', serializeSession(latestSwitch));
                return;
            }
            // Explicit attack action (default)
            // If action is not 'switch', we resolve an attack using current active
            const opponentIndex = getOpponentIndex(currentIndex);
            const defender = session.players[opponentIndex];
            // Ensure valid active selections point to living Pokémon
            current.activeIndex = getFirstAliveIndex(current.team);
            defender.activeIndex = getFirstAliveIndex(defender.team);
            const attackerPokemon = current.team[current.activeIndex];
            const defenderPokemon = defender.team[defender.activeIndex];
            const dmg = calculateDamage(attackerPokemon, defenderPokemon);
            defenderPokemon.currentHp = Math.max(0, defenderPokemon.currentHp - dmg);
            if (defenderPokemon.currentHp === 0) {
                const hasAlive = defender.team.some((p) => p.currentHp > 0);
                if (!hasAlive) {
                    session.status = 'completed';
                    session.winner = current.id;
                    await User.findByIdAndUpdate(current.id, { $inc: { wins: 1 } });
                    await User.findByIdAndUpdate(defender.id, { $inc: { losses: 1 } });
                    await GameSession.updateOne({ _id: session._id }, {
                        $set: {
                            players: session.players,
                            status: session.status,
                            winner: session.winner,
                            turn: session.turn,
                        },
                    });
                    const latestWin = await GameSession.findOne({ roomId });
                    io.to(roomId).emit('updateGame', serializeSession(latestWin));
                    io.to(roomId).emit('gameEnd', { winner: String(current.id) });
                    return;
                }
                // Auto-select next alive defender active for UI
                defender.activeIndex = getFirstAliveIndex(defender.team);
            }
            session.turn = opponentIndex;
            await GameSession.updateOne({ _id: session._id }, {
                $set: {
                    players: session.players,
                    status: session.status,
                    winner: session.winner ?? null,
                    turn: session.turn,
                },
            });
            const latest = await GameSession.findOne({ roomId });
            io.to(roomId).emit('updateGame', serializeSession(latest));
        });
    });
}



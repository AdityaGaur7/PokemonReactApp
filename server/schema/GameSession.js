import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema(
    {
        id: Number,
        name: String,
        baseStats: {
            hp: Number,
            attack: Number,
            defense: Number,
        },
        currentHp: Number,
        types: [String],
    },
    { _id: false }
);

const playerSchema = new mongoose.Schema(
    {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        team: [pokemonSchema],
        activeIndex: { type: Number, default: 0 },
        ready: { type: Boolean, default: false },
    },
    { _id: false }
);

const gameSessionSchema = new mongoose.Schema(
    {
        roomId: { type: String, unique: true },
        players: [playerSchema],
        status: { type: String, enum: ['waiting', 'in_progress', 'completed'], default: 'waiting' },
        turn: { type: Number, default: 0 },
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true }
);

export default mongoose.model('GameSession', gameSessionSchema);



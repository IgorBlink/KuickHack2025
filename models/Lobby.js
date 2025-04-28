const { Schema, model } = require("mongoose");

const PlayerSchema = new Schema({
    nickname: {
        type: String,
        required: true
    }
}, { _id: false });

const LobbySchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [PlayerSchema], // Никнеймы игроков (без авторизации)
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Lobby', LobbySchema);

const { Schema, model } = require("mongoose");

const PlayerSchema = new Schema({
    nickname: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    currentQuestion: {
        type: Number,
        default: 0
    },
    walletAddress: { 
        type: String, 
        required: true 
    },
    streak: {
        type: Number,
        default: 0
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
    players: [PlayerSchema],
    started: { 
        type: Boolean, 
        default: false
    },
    baseReward: { 
        type: Number, 
        required: true
    },

    withReward: { // ➡️ будет ли TON награда
        type: Boolean, 
        default: false 
    },   
    rewardBalance: { // ➡️ сколько TON в банке
        type: Number, 
        default: 0 
    },     
    paid: { // ➡️ Оплачено или нет
        type: Boolean, 
        default: false 
    },         

    createdAt: { type: Date, default: Date.now }
});

module.exports = model('Lobby', LobbySchema);

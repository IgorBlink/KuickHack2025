const { Schema, model } = require("mongoose");

const PlayerSchema = new Schema({
    nickname: { type: String, required: true },
    walletAddress: { type: String, required: true },
    score: { type: Number, default: 0 },
    currentQuestion: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
}, { _id: false });

const LobbySchema = new Schema({
    code: { type: String, required: true, unique: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    players: [PlayerSchema],
    started: { type: Boolean, default: false },
    baseReward: { type: Number, required: true },

    withReward: { type: Boolean, default: false },  // ➡️ Есть ли награда
    rewardBalance: { type: Number, default: 0 },    // ➡️ Сколько TON закинули
    paid: { type: Boolean, default: false },        // ➡️ Оплачено или нет
    rewardDistributed: { type: Boolean, default: false }, // ➡️ Раздали награды или нет

    createdAt: { type: Date, default: Date.now }
});

module.exports = model('Lobby', LobbySchema);

const { Schema, model } = require('mongoose');

const gameSchema = new Schema(
{
    id: String,
    players:[
        {
            playerId: String,
            playerName: String,
            moves: [String],
            activies: [String]
        }
    ],
    results:[
        {
            winnerId: String,
            round: Number
        }
    ],
    date: {type: Date, default: Date.now}
});
module.exports = new model('Game', gameSchema);
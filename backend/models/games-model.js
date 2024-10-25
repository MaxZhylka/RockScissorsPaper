const { Schema, model } = require('mongoose');

const gameSchema = new Schema(
{
    id: String,
    players:[
        {
            playerId: String,
            playerName: String,
            moves: [String],
            actions: [String],
            isLoose: { type: Boolean, default: false }
        }
    ],
    results:[
        {
            winnerId: [String],
            winnerName: [String],
            round: Number
        }
    ],
    isDisplay:{type: Boolean, default:false},
    winner:String,
    winnerId:String,
    date: {type: Date, default: Date.now}
});
module.exports = new model('Game', gameSchema);
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
            isLoose: { type: Boolean, default: false },
            score: { type: Number, default: 0 }
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
    winner:{type: String, default: ""},
    winnerId:{type: String, default: ""},
    nextGameId:String,
    gameNumber:{type: String, default: ""},
    onlyTwoPlayers:{type: Boolean, default:false},
    date: {type: Date, default: Date.now}
});
module.exports = new model('Game', gameSchema);
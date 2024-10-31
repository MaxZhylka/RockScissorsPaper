const { Schema, model, Types } = require('mongoose');

const tournamentSchema = new Schema({
    games: [
        { type: Types.ObjectId, ref: 'Game' }, 
        { type: Types.ObjectId, ref: 'Game' }, 
        { type: Types.ObjectId, ref: 'Game' }  
    ],
    name: { type: String, index: true, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = model('Tournament', tournamentSchema );
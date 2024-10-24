const { Schema, model } = require('mongoose');

const tokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true },
    refreshToken: { type: String, required: true }
});

module.exports = model('Token', tokenSchema);
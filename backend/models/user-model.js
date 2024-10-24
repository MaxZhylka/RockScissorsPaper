const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        maxlength: [20, 'Username must be at most 20 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Email is invalid']
    },
    password: {
        type: String,
        required: true,
    },
    confirmationToken: String,
    isConfirmed: { type: Boolean, default: false },
    expires:{type: Date, default: Date.now, expires:'30m'},
    date: { type: Date, default: Date.now }
});


userSchema.pre('save', async function(next) {

    if (!this.isModified('password')) return next();

    const password = this.password;
    const hasValidLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasValidLength || !hasUpperCase) {
        return next(new Error('Password must be more than 8 characters long and include at least one uppercase letter'));
    }

    try{
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
    }
    catch(error){
        next(error);
    }
});


module.exports = mongoose.model('User', userSchema);
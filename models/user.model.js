const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    create: Date
});

const User = mongoose.model('User', userSchema);
module.exports = User;
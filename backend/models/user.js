const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profileURL: { type: String, required: true},
    about: { type: String, required: true }
})

const User = mongoose.model('User', schema);
module.exports = User;
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fullname: { type: String },
    birthday: { type: Date },
    address: { type: String },
    phone: { type: String },
    address: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    register_date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', UserSchema);
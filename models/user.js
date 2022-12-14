const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, min: 8 },
    favoriteItems: [String], 
    favoriteUsers: [String]
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
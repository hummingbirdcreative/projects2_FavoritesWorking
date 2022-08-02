//Mongoose Schema/Model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema(
    {
        name: { type: String, required: true },
        brand: String,
        type: String, 
        description: String,
        img: String,
        notes: String,
        itemIsFavorite: Boolean,
        user: { type: Schema.Types.ObjectId, ref: "User" }
    }
)

module.exports = mongoose.model('Item', itemSchema)
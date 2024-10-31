const mongoose = require("mongoose");

const itemsSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    itemsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    
})

module.exports = mongoose.model("Item", itemsSchema);
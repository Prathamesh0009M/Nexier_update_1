const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  
    itemsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required:true,
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    comment: {
        type: String,
        required:true,
    }, createdAt: {
        type: Date,
        default: Date.now // Automatically set to the current date and time
    },
})

module.exports = mongoose.model("review", reviewSchema);
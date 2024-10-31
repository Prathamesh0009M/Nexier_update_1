const mongoose = require("mongoose");

const conveseSchema = new mongoose.Schema({

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    ImageUrl_1: {
        type: String,
        // required:true,  
    },
    ImageUrl_2: {
        type: String,
        // required:true,  
    },
    commonImage: {
        type: String
    },
    commonName: {
        type: String,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },

}, { timestamps: true })

module.exports = mongoose.model("Conversation", conveseSchema);
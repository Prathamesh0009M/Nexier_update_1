const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },

    YearAndBranch: {
        type: String,
        required: true,
        trim: true,
    },

    collegeId: {
        type: String,
        required: true,

    },
    // phoneNumber: {
    //     type: String,
    //     required: true,

    // },
    password: {
        type: String,
        required: true,

    },
    accountType: {
        type: String,
        enum: ["Admin", "Student"],
        required: true,
    },
    additionaldetail: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
    },
    contactNumber: {
        type: Number,
        // required: true,
    },
    itemsToSell: [{
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: "Item",
    }],
    itemsBought: [{
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: "Item",
    }],
    image: {
        type: String,
        required: true,
    },
    converSationId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        // required: true,
    }],
    follower: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    lastEmailSent: {
        type: Date,
        default: null, // Initially, no email is sent
    },
    token: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    intrestedIn: {
        type: String,
        
    }
})

module.exports = mongoose.model("User", userSchema);
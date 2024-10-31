const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    rentalPrice: {
        type: Number,
        required: true,
    },
    rentalStartDate: {
        type: Date,
        // required: true,
    },
    rentalEndDate: {
        type: Date,
        // required: true,
    },
    returnStatus: {
        type: String,
        enum: ["Pending", "Returned", "Overdue"],
        default: "Pending",
    },
    rentalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // User who is renting the item
        // required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Rentals", rentalSchema);

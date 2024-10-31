const mongoose = require("mongoose");
const { checkAndSendEmail } = require("../controllers/MessageService");

// TOBE : rental price will be based on duration 
const itemsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bids"
    }],

    winnerOfbids: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    review: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
        required: true,
    }],

    // gadbad 
    rentalServices: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rentals"
    },
    thumbnail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        // required: true,
        enum: ["Available", "Sold", "Reserved"]
    },
    condition: {
        type: String,
        enum: ["New", "Like New", "Used"]
    },
    location: {
        type: String,
        // required: true,
    },
    ItemStatus: {
        type: String,
        enum: ["Draft", "Published"],
    },
    views: {
        type: Number,
        default: 0
    },
    rentalAvailable: {
        type: String,
        enum: ["Available", "Not Available"],
        // required: true,
    },
    rentalPrice: {
        type: Number,
        required: function () { return this.rentalAvailable === "Available"; },
    },
    rentalDuration: {
        type: String,
        required: function () { return this.rentalAvailable === "Available"; },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // updatedAt: {
    //     type: Date,
    //     default: Date.now
    // }
});

// Update `updatedAt` field before saving the document
// itemsSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });
itemsSchema.post('save', async function (doc) {
    // Check if the document is new
    if (this.isNew) {
        await checkAndSendEmail(); // Call the function only for new items
    }
});




module.exports = mongoose.model("Item", itemsSchema);

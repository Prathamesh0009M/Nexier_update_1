const mongoose = require("mongoose");

// at bid customer will activate bids on his product then all the people who want to buy they will bid on item and then at end of the day final result with highest price will be winner

// now via itemId bring all the bids which contain /:itemId then take out winner from all the data fetched of bid 

const bidsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    priceOnItem: {
        type: Number,
        required:true,
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }
})

module.exports = mongoose.model("Bids", bidsSchema) 
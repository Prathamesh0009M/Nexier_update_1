const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // category could have multiple courses so array are used to add multiple courses
    Items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
    }]
})

module.exports = mongoose.model("Category", categorySchema) 
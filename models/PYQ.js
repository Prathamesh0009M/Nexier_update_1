const mongoose = require('mongoose');

// Schema to represent each question paper
const questionPaperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    YearofPaper: {
        type: String,
        // required: true,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true, // URL or path to the uploaded PDF or question paper file
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who uploaded the file
        required: true,
    }
});

// Main schema for organizing PYQs by branch and year
const pyqSchema = new mongoose.Schema({
    branch: {
        type: String,
        required: true,
        enum: ['CSE', 'IT', 'EXTC', 'ELECTRICAL', 'CIVIL', ',MECHANICAL','CHEMICAL','VLSI'], // Add more branches as needed
    },
    year: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4], // 1st, 2nd, 3rd, 4th year
    },
    papers: [questionPaperSchema], // Embedding multiple question papers within each year/branch
});

module.exports = mongoose.model('PYQ', pyqSchema);

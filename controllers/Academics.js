const PYQ  = require("../models/PYQ");
const User = require("../models/User");

const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.addPyq = async (req, res) => {
    try {
        const { branch, year, title, subject,YearofPaper } = req.body;
        const adminId = req.user?.id;  // Optional chaining to avoid errors if req.user is undefined


        
        const adminUser = await User.findById(adminId);

        
        if (!adminUser || adminUser.accountType !== "Admin") {
            return res.status(403).json({ message: 'You do not have permission to upload PYQs.' });
        }

        let pyqEntry = await PYQ.findOne({ branch, year });  // Use findOne instead of find to get a single document

        if (!pyqEntry) {
            pyqEntry = new PYQ({ branch, year, papers: [] });
        }

        let fileUrl = '';
        if (req.files && req.files.file) {
            const file = req.files.file;

            // Determine the folder based on the file type
            let folder = 'pyq_images';  // Default folder for images
            if (file.mimetype === 'application/pdf') {
                folder = 'pyq_pdfs';  // Folder for PDFs
            }

            // Upload to Cloudinary
            const result = await uploadImageToCloudinary(file, folder, null, 80);
            fileUrl = result.secure_url;  // Save the URL returned by Cloudinary
        } else {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        pyqEntry.papers.push({
            title,
            YearofPaper,
            subject,
            fileUrl,
            uploadedBy: adminId,
        });

        await pyqEntry.save();

        return res.status(201).json({
            success: true,
            message: 'PYQ added successfully!',
            data: pyqEntry,
        });

    } catch (e) {
        console.error('Error adding PYQ:', e);
        return res.status(500).json({ message: 'Internal server error at adding PYQ' });
    }
}


exports.findPapers = async (req, res) => {
    try {
        const { year, branch } = req.body;

        // Validate the inputs
        if (!year || !branch) {
            return res.status(400).json({ message: 'Year and branch are required.' });
        }

        // Find the PYQ document for the given year and branch
        const pyqEntry = await PYQ.findOne({ year, branch });
        



        // Check if the document exists
        if (!pyqEntry) {
            return res.status(404).json({ message: 'No papers found for the specified year and branch.' });
        }

        // Extract all the papers from the found document
        const papers = pyqEntry.papers;

        // Return the found papers
        return res.status(200).json({
            success: true,
            message: 'Papers retrieved successfully.',
            data: papers,  // Send the papers array directly
        });

    } catch (e) {
        console.error('Error finding papers:', e);
        return res.status(500).json({ message: 'Internal server error while fetching papers.' });
    }
}

















const User = require('../models/User');
const Feedback = require('../models/feedback'); // Adjust the path according to your file structure
const mailsender  = require("../utils/mailSender")
// BFS algorithm to find users connected through mutual followers/following
exports.bfsFindConnections = async (req, res) => {
    try {
        const { userId, depth = 2 } = req.body;
        let queue = [userId]; // Start BFS from the current user
        let visited = new Set(); // Track visited users
        let connections = []; // Store connections found
        let currentDepth = 0;

        while (queue.length > 0 && currentDepth < depth) {
            let nextQueue = [];

            for (let currentUserId of queue) {
                if (visited.has(currentUserId)) continue; // Avoid revisiting the user
                visited.add(currentUserId);

                // Fetch current user's following and followers
                const user = await User.findById(currentUserId).populate('following').populate('follower');

                if (user) {
                    // Add the following and followers to the next level of queue
                    user.following.forEach(followedUser => {
                        if (!visited.has(followedUser._id.toString())) {
                            nextQueue.push(followedUser._id.toString());
                            connections.push(followedUser); // Add to connections
                        }
                    });

                    user.follower.forEach(followerUser => {
                        if (!visited.has(followerUser._id.toString())) {
                            nextQueue.push(followerUser._id.toString());
                            connections.push(followerUser); // Add to connections
                        }
                    });
                }
            }
            queue = nextQueue;
            currentDepth++;
        }

        // If no connections found, fetch 10 random users
        if (connections.length === 0) {
            const randomUsers = await User.aggregate([{ $sample: { size: 10 } }]);
            connections = randomUsers; // Replace connections with random users
        }

        res.status(200).json({
            success: true,
            data: connections,
        });
    } catch (e) {
        console.log("Error at mutual connections:", e);
        res.status(401).json({
            success: false,
            message: e.message,
        });
    }
};


// In the submitFeedback function
exports.submitFeedback = async (req, res) => {
    try {
        const { firstname, lastname, email, phoneNo, message } = req.body;

        // Create a new feedback entry
        const newFeedback = new Feedback({
            firstname,
            lastname,
            email,
            phoneNo,
            message,
        });

        // Save the feedback entry to the database
        await newFeedback.save();

        // Format feedback data as a readable string for the email body
        const emailBody = `
            <h1>Nexier</h1>
            <h3>New Feedback Received</h3>
            <p><strong>First Name:</strong> ${newFeedback.firstname}</p>
            <p><strong>Last Name:</strong> ${newFeedback.lastname}</p>
            <p><strong>Email:</strong> ${newFeedback.email}</p>
            <p><strong>Phone Number:</strong> ${newFeedback.phoneNo}</p>
            <p><strong>Message:</strong> ${newFeedback.message}</p>
        `;

        // Send the email with formatted data
        await mailsender("prathameshj776@gmail.com", "Feed Back Response", emailBody);

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: newFeedback,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message,
        });
    }
};

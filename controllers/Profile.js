const Profile = require("../models/Profile");
const User = require("../models/User");
const ConverSation = require("../models/ConverSation")
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Item = require("../models/Items");
const mailsender = require('../utils/mailSender'); // Import the mail sender utility



exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        const id = req.user.id;
        // console.log(id);



        if (!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "All field are required",
            })
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionaldetail;

        const profileDetail = await Profile.findByIdAndUpdate(profileId,
            {
                dateOfBirth: dateOfBirth,
                about: about,
                gender: gender,
                contactNumber: contactNumber,
            }
        )


        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save();


        // profileDetail.dateOfBirth = dateOfBirth;
        // profileDetail.about = about;
        // profileDetail.gender = gender;
        // profileDetail.contactNumber = contactNumber;
        // await profileDetail.save();

        // console.log("i am here", firstName, lastName, dateOfBirth , about, contactNumber, gender)

        const UserAllData = await User.findById(id)
            .populate("additionaldetail")
            .populate("itemsBought").exec();


        
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: UserAllData,
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to update profile ",
            error: e.message,
        })
    }
}

// at time of delete also delete the  item which u want to delete 
exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;
        
        // Fetch the user's details to ensure user exists
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete the associated profile
        await Profile.findByIdAndDelete(userDetails.additionaldetail);

        // Delete all items created by the user
        await Item.deleteMany({ owner: id });

        // Delete the user account
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "USER DELETED SUCCESSFULLY, including all items created by the user",
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to delete user",
            error: e.message,
        });
    }
};

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        // Validate and get user details 
        const userDetails = await User.findById(id)
            .populate("additionaldetail")
            .populate("itemsBought")
            .populate({
                path: "converSationId",
                populate: [
                    {
                        path: "participants",
                        select: "firstName lastName email "  // Populate participant details 
                    },
                    {
                        path: "lastMessage",
                        select: "content isRead sentAt",  // Populate message content, isRead, and sentAt fields
                    }
                ]
            })
            .exec();

        // Return response 
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails,
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch user details",
            error: e.message,
        });
    }
};
exports.getFriendAllData = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate and get user details
        const userDetails = await User.findById(id)
            .populate("additionaldetail")
            .populate({
                path: "itemsToSell",
                select: "_id title thumbnail  views condition owner", // Select specific fields for items
            })
            .populate({
                path: "follower",
                select: "firstName lastName email image", // Select fields for followers
            })
            .populate({
                path: "following",
                select: "firstName lastName email image", // Select fields for following
            })
            .exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Friend not found",
            });
        }

        // Return response 
        return res.status(200).json({
            success: true,
            message: "Friend data fetched successfully",
            data: userDetails,
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch user details",
            error: e.message,
        });
    }
};



exports.getBoughtItems = async (req, res) => {
    try {
        const userId = req.user.id;

        const userDetails = await User.findOne({ _id: userId }).populate("itemsBought").exec();

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "could not find user with id", userDetails,
                error: e.message,
            });
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch enrolled products",
            error: e.message,
        });
    }
}



exports.updateDP = async (req, res) => {
    try {

        const DP = req.files.thumbnailImage;
        const newpicture = await uploadImageToCloudinary(DP, process.env.FOLDER_NAME);
        // console.log("current dp is ", newpicture);
        const imageUrl = newpicture.url;

        const userId = req.user.id;
        const user = await User.findByIdAndUpdate(userId, { image: imageUrl });

        return res.status(200).json({
            success: true,
            message: "Successfully to update user DP ",
            data: imageUrl,
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to update user_DP ",
            error: e.message,
        })
    }
}
exports.following = async (req, res) => {
    try {
        const id = req.user.id; // Current user's ID
        const { friendId } = req.body; // Friend's ID from the request

        // Fetch the current user's details
        const userDetails = await User.findById(id);

        // Check if friendId already exists in the 'following' list
        if (userDetails.following.includes(friendId)) {
            return res.status(400).json({
                success: false,
                message: "You are already following this user."
            });
        }

        // Add friendId to the following list of the current user
        await User.findByIdAndUpdate(id, {
            $push: { following: friendId }
        });

        // Add the current user's id to the follower list of the friend
        const friendDetails = await User.findByIdAndUpdate(friendId, {
            $push: { follower: id }
        });

        // Get conversation IDs from the second element onwards (index 1)
        const userConversationIds = userDetails.converSationId?.slice(1) || [];
        const friendConversationIds = friendDetails.converSationId?.slice(1) || [];

        // Convert ObjectId to string for comparison
        const commonConversationId = userConversationIds
            .map(id => id.toString())
            .find(convoId => friendConversationIds.map(id => id.toString()).includes(convoId));

        // If a common conversation ID exists, do not create a new conversation
        if (!commonConversationId) {
            const conversation = await ConverSation.create({
                participants: [id, friendId],
                ImageUrl_1: friendDetails.image,
                ImageUrl_2: userDetails.image,
            });

            await Promise.all([
                User.findByIdAndUpdate(id, { $push: { converSationId: conversation._id } }),
                User.findByIdAndUpdate(friendId, { $push: { converSationId: conversation._id } })
            ]);
        }

        // If userDetails is null (which shouldn't happen), return an error
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Failed to follow",
                error: "User not found"
            });
        }

        // Fetch the updated user details to send back in the response
        const user = await User.findById(id)
            .populate("additionaldetail")
            .populate("follower")
            .populate("following")
            .populate("itemsToSell");

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to follow",
            error: e.message,
        });
    }
};

exports.followerList = async (req, res) => {
    try {
        const id = req.user.id;

        // Fetch the user details along with populated fields
        const userDetails = await User.findById(id)
            .populate("additionaldetail")
            .populate("follower")
            .populate("following")
            .populate("itemsToSell");

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Failed to retrieve follower list",
            });
        }

        // Extract follower and following data
        const followers = userDetails.follower.map(follower => ({
            id: follower._id,
            firstName: follower.firstName,
            lastName: follower.lastName,
            email: follower.email,
            image: follower.image,
        }));

        const following = userDetails.following.map(followingUser => ({
            id: followingUser._id,
            firstName: followingUser.firstName,
            lastName: followingUser.lastName,
            email: followingUser.email,
            image: followingUser.image,
        }));

        return res.status(200).json({
            success: true,
            data: {
                userDetails: {
                    id: userDetails._id,
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    email: userDetails.email,
                    image: userDetails.image,
                    additionalDetail: userDetails.additionaldetail, // Include additional details if needed
                },
                followers,
                following,
            },
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Failed to fetch follower list",
            error: e.message,
        });
    }
};


const mongoose = require("mongoose");

const is48HoursPassed = (lastEmailSent) => {
    if (!lastEmailSent) return true; // If no email has been sent, send it
    const now = new Date();
    const timeDiff = now - new Date(lastEmailSent);
    return timeDiff >= 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

};


// Controller to get 10 random users not in the current user's following list
exports.getRandomUsersNotFollowing = async (req, res) => {
    try {
        const { userId } = req.body; // Assuming the current user's ID is passed as part of the request body
        
        // Find the current user to get the list of users they are following
        const currentUser = await User.findById(userId).select('following email lastEmailSent');

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if 48 hours have passed since the last email was sent
        const shouldSendEmail = is48HoursPassed(currentUser.lastEmailSent);

        // Find 10 random users who are not in the current user's following list
        const randomUsers = await User.aggregate([
            { 
                $match: { 
                    _id: { $nin: [...currentUser.following, currentUser._id] } // Exclude users already followed + current user
                } 
            },
            { $sample: { size: 10 } }, // Randomly pick 10 users
        ]);

        // Populate additionaldetail field in each user document
        const populatedUsers = await User.populate(randomUsers, { path: "additionaldetail" });

        // Send email if more than 1 user is found and 48 hours have passed
        if (populatedUsers.length > 1 && shouldSendEmail) {

            const emailBody = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-bottom: 2px solid #4CAF50;">
                    <h1 style="color: #4CAF50; font-size: 28px; margin-bottom: 10px;">Welcome to Nexier!</h1>
                    <p style="font-size: 18px; color: #555;">Discover new people and grow your network
                    in DBATU Campus !</p>
                </div>
        
                <div style="padding: 20px;">
                    <h2 style="color: #4CAF50; font-size: 24px; margin-bottom: 15px;">Here are some users you're not following yet:</h2>
                    <ul style="list-style-type: none; padding: 0;">
                        ${populatedUsers.map(user => `
                            <li style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                                <strong>${user.firstName} ${user.lastName}</strong>
                            </li>
                        `).join('')}
                    </ul>
        
                    <p style="font-size: 16px; color: #777;">
                        <strong>Nexier</strong> helps you connect with other students and professionals. 
                        Follow these users to expand your network and collaborate on new ideas!
                    </p>
                </div>
        
                <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 2px solid #4CAF50;">
                    <p style="font-size: 16px; color: #555;">
                        Ready to make new connections? 
                        <a href="https://www.nexier.com/login" style="color: #4CAF50; text-decoration: none; font-weight: bold;">Log in to Nexier</a>
                        and start following them!
                    </p>
                    <p style="font-size: 14px; color: #999;">This email was sent by Nexier, helping you grow your network and stay connected.</p>
                </div>
            </div>
        `;
        

            // Send email to the current user
            await mailsender(currentUser.email, 'Users You Might Want to Follow', emailBody);

            
            // Update the lastEmailSent field
            currentUser.lastEmailSent = new Date();
            await currentUser.save();
        }

        // Send the random 10 users as response
        return res.status(200).json({
            success: true,
            data: populatedUsers,
        });

    } catch (error) {
        console.error('Error in getRandomUsersNotFollowing:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

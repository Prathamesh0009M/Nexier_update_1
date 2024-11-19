const User = require("../models/User");
const OTP = require("../models/OTP");
const otpgenrater = require("otp-generator");
// changed 

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const ConverSation = require("../models/ConverSation");
const Message = require("../models/message")
require("dotenv").config();

// SendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from request ki body 
        const { email } = req.body;

        // check user already exist or not 
        const checkUserPresent = await User.findOne({ email });

        // if user present 
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered ",
            })

        }

        // or generate otp 
        var otp = otpgenrater.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        
        // check unique otp or not 

        var result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpgenrater(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };

        // create an entry in DB for OTP 
        const otpbody = await OTP.create(otpPayload);

        
        // return response successfully 

        res.status(200).json({
            success: true,
            message: "OTP sent Successfully to Email"
        });


    } catch (e) {
        console.log("while sending otp ", e);
        res.status(500).json({
            success: false,
            message: e.message,
        })

    }
}


// signup

exports.signUp = async (req, res) => {
    try {
        // data fetch  from req ki body
        const { firstName, lastName, email, password, confirmPassword,
            // accountType,
            // contactNumber,
            otp,
            // collegeId,
            commonChatId, YearAndBranch } = req.body;



        // validation karlo 
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !YearAndBranch) {

            return res.status(403).json({
                success: false,
                message: "All field are must required",
            })
        }
        // console.log("i am here with RECENT OTP :- ");

        // 2 password match karlo -> pass and cnfrm pass
        if (password !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: "password and conformpassword doesnot match plz try again later",

            })
        }

        // check user already present or not 
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User Already registered ",

            })
        }

        // find most recent otp stored for the user 
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);



        // console.log("i am here with otp :- ", otp);
        // validation OTP 
        if (recentOTP.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found  ",

            });

        } else if (otp !== recentOTP[0].otp) {
            // invalid OTP 
            return res.status(400).json({
                success: false,
                message: "Invalid OTP ",
            })
        }
        // 40 minute -2;

        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);
        //  entry in db of pass

        const profileDetail = await Profile.create({
            gender: null,
            dateOfBirth: null,
            contactNumber: null,
            about: null,

        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            // contactNumber,
            password: hashedPassword,
            accountType: email == 'prathameshj776@gmail.com' ? 'Admin' : "Student",
            // collegeId,
            additionaldetail: profileDetail._id,
            YearAndBranch,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            // intrestedIn: accountType ? accountType : null,
        })

        const updateConverseId = await User.findByIdAndUpdate(user._id,
            { $push: { converSationId: '66f840e0880017cf58164dde' } }
        )


        const addInCommunity = await ConverSation.findByIdAndUpdate('66f840e0880017cf58164dde', {
            $push: { participants: user._id }
        }, { new: true });

        const firstMessage = await Message.create({
            conversationId: '66f840e0880017cf58164dde',
            sender: user._id,
            content: `${firstName} just joined`
        })

        // return res 
        return res.status(200).json({
            success: true,
            message: "user registerd successfully",
            // data:user
        })

    } catch (e) {
        console.log("while sign-up ", e);
        res.status(500).json({
            success: false,
            message: e.message,
        })
    }
}



// login
exports.login = async (req, res) => {
    try {
        // get data from req body 
        const { email, password } = req.body;



        // validation data
        if (!email || !password) {
            res.status(403).json({
                success: false,
                message: "All field are required",
            })
        }

        // check existing of user 
        // const user = await User.findOne({ email });
        // const user = await User.findOne({ email }).populate('additionaldetail').exec();
        // const extrainfo= await User.findOne({email}).populate('additionaldetail').exec();

        const user = await User.findOne({ email }).populate('additionaldetail');

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not registered plz sign-up first",
            })
        };

        // generate JWT token ,after password matching
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h", });

            user.token = token;
            user.password = undefined;

            const option =
            {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            // create cookie and send response 
            res.cookie("token", token, option).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in Successfully",
            });

        } else {
            res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })
        }

    } catch (e) {
        console.log("Login problem ", e);
        res.status(501).json({
            success: false,
            message: e.message,
        })
    }
}

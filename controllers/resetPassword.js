const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const emailTemplate  = require("../Templates/emailTemplates")



// reset pass token generator
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req.body
        const email = req.body.email;
            
        // check user for email and validate 
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Your email is not registered with Us",
            });
        }
   
        // generate token
        const token = crypto.randomUUID();

        //  update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        }, { new: true });

        // create url 

        const url = `http://localhost:3000/update-password/${token}`;

        const htmlContent = emailTemplate(url); // Generate the HTML content
        await mailSender(email, "Password Reset Link", htmlContent);

        // return response 
        res.json({
            success: true,
            message: "email sent successfully plz check email and change password",
        });

    } catch (e) {
        console.log("something went wrong while reset password", e)
        res.status(403).json({
            success: false,
            message: "something went wrong while reset password ",
        })
    }
    // 1:28 

}

// reset pass

exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        //  fronted added token to the body so token achieved
        const { password, confirmPassword, token } = req.body;
        // validation 
        if (password != confirmPassword) {
            res.json({
                success: false,
                message: "  password not matching ",
            });
        }
        //  get user details
        const userDetails = await User.findOne({ token: token });

        //  if no entry-Invalid token 
        if (!userDetails) {
            res.json({
                success: false,
                message: "  token is invalid ",
            });
        }
        // time for token 
        if (userDetails.resetPasswordExpires < Date.now()) {
            res.json({
                success: false,
                message: "  token is Expired plz regenerate your token ",
            });
        }
        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password 
        await User.findOneAndUpdate({ token: token }, { password: hashedPassword }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Password reset Successfuly"
        })

    } catch (e) {
        console.log("something went wrong while reset password", e)
        res.status(403).json({
            success: false,
            message: "something went wrong while reset password ",
        })
    }
}





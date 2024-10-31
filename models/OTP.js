const mongoose = require("mongoose");
const mailsender = require("../utils/mailSender");
const otpEmailTemplate =require("../Templates/otpEmailTemplate")

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 *5*5* 60,
    }
    
});

// emailsender
async function sendverification(email, otp) {
    try {
        const emailBody = otpEmailTemplate(otp);
        const mailResponse = await mailsender(email, "Verification Email from Nexier", emailBody);
        console.log("Mail sent successfully ", mailResponse);
    } catch (e) {
        console.log("Error occurred while sending mail ", e);
        throw e;
    }
}

    
OTPSchema.pre("save", async function (next) {
    await sendverification(this.email, this.otp);
    next();
});


module.exports = mongoose.model("OTP", OTPSchema);
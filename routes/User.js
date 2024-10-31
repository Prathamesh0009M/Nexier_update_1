const express = require("express");
const router = express.Router();

const { auth } = require("../middelwares/auth");

const {sendOTP,signUp,login} =require("../controllers/Auth")
const {resetPassword,resetPasswordToken} =require("../controllers/resetPassword")
const {submitFeedback} =require("../controllers/FriendConnection")


router.post("/login", login);
router.post("/signUp", signUp);
router.post("/sendOTP", sendOTP);

router.post("/resetPasswordToken",resetPasswordToken)
router.post("/resetPassword",resetPassword)
router.post('/submit-feedback', submitFeedback);

module.exports = router;





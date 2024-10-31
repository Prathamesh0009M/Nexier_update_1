const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")


// auth
exports.auth = async (req, res, next) => {
    try {
        
        // extract token
        
        // const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer", "");
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        

    

       
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is missing",
            })
        }

        console.log(" token are checked ", token);
        // verify the token 
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decode;

        } catch (e) {
            return res.status(401).json({
                success: false,
                message: "token is Invalid ",
            })

        }
        next();

    } catch (e) {
        return res.status(401).json({
            success: false,
            message: "something went wrong while vaidating the token",
        })
    }
}


// is student 
exports.isStudent = (req, res, next) => {
    try {

        if (req.user.accountType !== "Student") {
            return res.status(400).json({
                success: false,
                message: "this is protected route for student only",
            })
        }

        next();

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified",
        })
    }
}



exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(400).json({
                success: false,
                message: "this is protected route for Admin only",
            })
        }
        next();

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified",
        })
    }
};





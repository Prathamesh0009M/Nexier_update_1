// const Item = require("../models/Items");
const User = require("../models/User");
const mailsender = require("../utils/mailSender");

const generateEmailContent = (newProducts) => {
    let productList = '';

    newProducts.forEach(product => {
        productList += `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
            <h3 style="color: #4CAF50;">${product.title}</h3>
            <p><strong>Description:</strong> ${product.description}</p>
        </div>`;
    });

    return `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="text-align: center; color: #4CAF50;">Top 10 New Items on Nexier Campus Item Selling Platform!</h1>
        <p style="text-align: center; font-size: 16px;">We're excited to share the latest additions to our platform. Check out these awesome new items posted by students:</p>
        ${productList}
        <p style="text-align: center; font-size: 16px; color: #333;">
            Don't miss the chance to grab these items before they're gone! 
            <br><br>
            <a href="https://nexier.vercel.app/" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Visit Nexier Platform Now
            </a>
        </p>
        <br>
        <p style="text-align: center; font-size: 12px; color: #888;">
            This email was sent to you by Nexier Campus Item Selling Platform.
        </p>
    </div>`;
};


const sendEmailsToAllStudents = async (newProducts) => {
    try {
        const user = await User.find({}, 'email'); // This retrieves all users and only includes the email field

        const emails = user.map(userEmail => userEmail.email).limit(50);

        const emailBody = generateEmailContent(newProducts);

        
        for (let email of emails) {

            await mailsender(email, 'New Products Added!', emailBody);
        }



        
    } catch (e) {
        console.error('Error sending emails to students:', e);
    }

}


exports.checkAndSendEmail = async () => {
    try {
        // Fetch the count of all items in the database
        // const allProducts = await Item.count({});
        const Item = require('../models/Items');
        const allProducts = await Item.countDocuments({ status: "Available" });
        // console.log("all data are",allProducts)

        
        // Check if the count is a multiple of 5
        if (allProducts > 0) {
            // Get the 5 most recently added products
            const newProducts = await Item.find().sort({ createdAt: -1 }).limit(5);
            // console.log("allldata ", newProducts);

            // Send email to students with new products
            await sendEmailsToAllStudents(newProducts);


        }
    } catch (e) {
        console.error('Error checking product count or sending emails:', e);
    }
};




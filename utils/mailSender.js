const nodemailer = require("nodemailer");

const mailsender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });


        
        let info = await transporter.sendMail({
            from: 'pratham',
            to: email,
            subject: title,
            html: body,
        });
        // console.log(" hi i am here ")
        

        return info;
    } catch (e) {
        console.log(e.message);
        throw e;
    }
}

module.exports = mailsender;

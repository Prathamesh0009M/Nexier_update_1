// utils/emailTemplate.js
const emailTemplate = (url) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h2 {
                color: #4CAF50;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                margin: 20px 0;
                color: white;
                background-color: #4CAF50;
                border-radius: 5px;
                text-decoration: none;
            }
            .footer {
                margin-top: 20px;
                font-size: 0.9em;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${url}" class="btn">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
                <p>Thank you,</p>
                <p>Team Nexier</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = emailTemplate;

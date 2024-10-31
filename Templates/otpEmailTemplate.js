const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4F46E5; /* Purple color */
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5; /* Purple color */
            padding: 10px;
            border: 2px solid #4F46E5; /* Purple border */
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            background-color: #f4f4f4;
            color: #333;
            padding: 10px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #4F46E5; /* Purple link */
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Nexier!</h1>
        </div>
        <div class="content">
            <h2>OTP Verification</h2>
            <p>Thank you for signing up! To complete your registration, please enter the OTP below:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for a short period. Please use it quickly to verify your email address.</p>
        </div>
        <div class="footer">
            <p>If you did not request this email, please ignore it.</p>
            <p>&copy; ${new Date().getFullYear()} Nexier. All Rights Reserved.</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Support</a></p>
        </div>
    </div>
</body>
</html>
`;

module.exports = otpEmailTemplate;

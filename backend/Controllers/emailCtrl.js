const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendEmail = asyncHandler(async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MP,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.MAIL_ID, // sender address
        to: data.to.join(", "), // list of receivers
        subject: data.subject,
        text: data.text, // plain text body
        html: data.html, // html body
    });

    console.log("Message sent: %s", info.messageId);
});

module.exports = sendEmail;

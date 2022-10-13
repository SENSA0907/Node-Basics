const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    // transpoeter is the service provider
    console.log(options)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASS
        }
    })


    // 2. Creating options for email
    const mailDetails = {
        from: 'sensa0907@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3. Sending email
    await transporter.sendMail(mailDetails)
}

module.exports = sendEmail;
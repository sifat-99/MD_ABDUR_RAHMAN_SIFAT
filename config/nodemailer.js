import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

export const autoReplyTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTO_REPLY_EMAIL,
        pass: process.env.AUTO_REPLY_PASSWORD
    }
})

export const mailOptions = {
    from: process.env.EMAIL,
    to: 'mdabdurrahmansifat@gmail.com',

}

const nodemailer = require('nodemailer');
require('dotenv').config();
const post=process.env.POST_ADRESS;
const password=process.env.POST_PASSWORD;
const serverAdress=process.env.THIS_SERVER_ADRESS;
const transporter = nodemailer.createTransport(
    {
        service:'gmail',
        auth:
        {
            user:post,
            pass:password
        }
    }
)

const sendConfirmationEmail=(user,token)=>
    {
        const mailOptions={
            from:'dexhonesta@gmail.com',
            to: user.email,
            subject:'Please confirm your email',
            text: `Click on the following link to confirm your email:  ${serverAdress}/confirm?token=${token}`
        }
        return transporter.sendMail(mailOptions);
    }
module.exports=sendConfirmationEmail;
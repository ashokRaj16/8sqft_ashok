import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
// import { sendMailTemplate } from './src/helper/mailHelper.js';

dotenv.config();

let mailConfig = {
    host: process.env.MAIL_HOST || "test",
    // port: process.env.MAIL_PORT || 465,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER || "",
        pass: process.env.NEXUS_MAIL_AUTH_PASS || ""
    },
    socketTimeout: 30000, // Timeout after 30 seconds
    connectionTimeout: 30000, // Timeout after 30 seconds
}

export const sendMail = async (to , subject = "", text = "", html = "" ) => {
    try{
        const transporter = nodemailer.createTransport(mailConfig);
        
        transporter.verify(function (error, success) {
            if (error) {
            //   console.log(error);
              return error
            } 
        });
        const info = await transporter.sendMail({
            from: {
                name: "Nexus Yard",
                address: process.env.EMAIL_ADDRESS || "test@test.com"                
            },
            to,
            subject,
            text,
            html
        });
        
        return info;
    }
    catch(error)
    {
        throw error;
    }
}


export const sendMailTemplate = async (to, subject = "", text = "", html = "", retries = 3 ) => {
    try {
        const transporter = nodemailer.createTransport(mailConfig);
        
        await transporter.verify();
        let result; 
        while(retries > 0) {
            try{

                result = await transporter.sendMail({
                    from: {
                        name: "Nexus Yard",
                        address: process.env.EMAIL_ADDRESS || "ashoksqft@gmail.com"                
                    },
                    to,
                    subject,
                    text,
                    html
                });
                break;
            }
            catch(error) {

                retries--;
                if(retries === 0){
                    throw error;
                }
            }
        }
        return result;
    }
    catch(error)
    {
        throw error;
    }
}

export function renderEmailTemplate(templateName, data, app){
    return new Promise((resolve, reject) => {
        app.render(templateName, data, (err, html) => {
            if(err) {
                reject(err);
            }
            else{
                resolve(html);
            }
        })
    } )
};
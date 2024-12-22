import nodemailer from 'nodemailer';

let mailConfig = {
    host: process.env.MAIL_HOST || "test",
    port: process.env.MAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER || "",
        pass: process.env.MAIL_AUTH_PASS || ""
    }
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
        return error;
    }
}
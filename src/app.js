import express from 'express';
import path from 'path';
import { sendMailTemplate, renderEmailTemplate } from '../src/helper/mailHelper.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve('src', 'views'));

// app.set('views', path.join(path.dirname(new URL(import.meta.url).pathname), "views"));
// console.log(path.join(path.dirname(new URL(import.meta.url).pathname), "views") );
// console.log("Path: ", path.resolve('src', 'views'));
// app.use(express.urlencoded({ extended: true }));

app.get('/send-email', async (req, res) => {
    try {

        // Setup email data
        let mailOptions = {
            to: 'ashokambore16@gmail.com', // replace with recipient's email
            text : 'Test mail',
            subject: 'Hello ✔'
        };

        // You can use both method.
        const emailTemplate = await renderEmailTemplate('email', {name : 'User'}, app);
        // *** wait for email send response, for OTP we have to wait for mail to send.
        // await sendMailTemplate(mailOptions.to, mailOptions.subject, mailOptions.text, emailTemplate);
        
        // *** send email in background in next phase of iteration. for order confirmation mail we don't need to wait.
        setImmediate( async () => {
            try {
                await sendMailTemplate(mailOptions.to, mailOptions.subject, mailOptions.text, emailTemplate);
                console.log('sent in back')
            }
            catch{
                console.log('Error log in back...');
            }
        })

        res.json({status: true, message: 'Email sent successfully'});

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, error: error});
    }
});

app.get('/', (req, res) => {
    res.render('index');
})

app.get('*', (req, res) => {
    res.render('404');
})

export default app;
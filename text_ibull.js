const express = require('express');
const Bull = require('bull');
const sendMailTemplate = require('./mail'); // Import the helper function
const app = express();
require('dotenv').config(); // Load environment variables from .env file

// ### learn this.
// Create a Bull queue
const emailQueue = new Bull('emailQueue', 'redis://127.0.0.1:6379'); // Ensure Redis is running

// Define the email sending job processor
emailQueue.process(async (job) => {
    try {
        const { to, subject, text } = job.data;
        await sendMailTemplate(to, subject, text);
        console.log('Email sent for job:', job.id);
    } catch (error) {
        console.error('Error sending email for job:', job.id, error);
    }
});

// Endpoint to trigger email sending
app.get('/send-email', async (req, res) => {
    try {
        // Setup email data
        const mailOptions = {
            to: 'recipient@example.com', // Replace with the recipient's email
            text: 'This is a plain text email sent from the Node.js server.',  // Plain text content
            subject: 'Plain Text Email ✔',
        };

        // Add the email sending job to the queue (does not block the request)
        await emailQueue.add(mailOptions);

        // Respond to the user immediately
        res.send('Email sending initiated in the background');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error initiating email sending: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

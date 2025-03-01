const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Replace with your GitHub webhook secret
const WEBHOOK_SECRET = 'your_webhook_secret';

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    // // Verify the webhook signature
    // const signature = req.headers["x-hub-signature-256"];
    // if (!signature) {
    //   console.error("No signature found");
    //   return res.status(400).send("No signature found");
    // }

    // const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    // const digest =
    //   "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

    // if (signature !== digest) {
    //   console.error("Invalid signature");
    //   return res.status(401).send("Invalid signature");
    // }

    // Check if the event is a push event
    const event = req.headers['x-github-event'];
    console.log(event);
    if (event === 'push') {
        console.log('Push event received');

        // Run your custom commands here
        exec('cd .. && git pull && npm run all', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err.message}`);
                return res.status(500).send('Error updating repository');
            }
            console.log(`Output: ${stdout}`);
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            res.status(200).send('Repository updated and app restarted successfully');
        });
    } else {
        res.status(200).send('Event ignored');
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook listener running on port ${PORT}`);
});

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
    // Verify the webhook signature
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        console.error('No signature found');
        return res.status(400).send('No signature found');
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
        console.error('Invalid signature');
        return res.status(401).send('Invalid signature');
    }

    // Check if the event is a push event
    const event = req.headers['x-github-event'];
    if (event === 'push') {
        console.log('Push event received');

        // Run Docker commands to rebuild and restart the app
        console.log('Starting Docker deployment...');

        exec(
            `
            cd .. && \
            git reset --hard && \
            git pull origin main && \
            docker build -t nextjs-app . && \
            docker stop nextjs-container || true && \
            docker rm nextjs-container || true && \
            docker run -d -p 3000:3000 --name nextjs-container nextjs-app
        `,
            (err, stdout, stderr) => {
                if (err) {
                    console.error('Docker deployment failed!');
                    console.error(`Error: ${err.message}`);
                    console.error(`Command: ${err.cmd}`);
                    console.error(`Exit code: ${err.code}`);
                    console.error(`Signal: ${err.signal}`);
                    return res.status(500).send('Error updating repository');
                }

                // Log the standard output
                console.log('Docker deployment succeeded!');
                console.log('Standard Output:');
                console.log(stdout);

                // Log the standard error (if any)
                if (stderr) {
                    console.error('Standard Error:');
                    console.error(stderr);
                }

                res.status(200).send('Repository updated and app restarted successfully');
            }
        );
    } else {
        console.log(`Ignored event: ${event}`);
        res.status(200).send('Event ignored');
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook listener running on port ${PORT}`);
});

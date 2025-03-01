const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event'];

    if (event !== 'push') {
        console.log(`Ignored event: ${event}`);
        return res.status(200).send('Event ignored');
    }

    console.log('Push event received. Starting Docker deployment...');

    try {
        // Ensure we're in the correct repo directory
        console.log('Resetting and pulling latest code...');
        execSync('git reset --hard', { stdio: 'inherit' });
        execSync('git pull origin main', { stdio: 'inherit' });

        // Build and restart Docker container
        console.log('Building new Docker image...');
        execSync('docker build -t nextjs-app .', { stdio: 'inherit' });

        console.log('Stopping existing container (if running)...');
        execSync('docker stop nextjs-container || true', { stdio: 'inherit' });
        execSync('docker rm nextjs-container || true', { stdio: 'inherit' });

        console.log('Starting new container...');
        execSync('docker run -d -p 3000:3000 --name nextjs-container nextjs-app', { stdio: 'inherit' });

        console.log('Deployment successful!');
        res.status(200).send('Repository updated and app restarted successfully');
    } catch (error) {
        console.error('Docker deployment failed!');
        console.error(error.stack);
        res.status(500).send('Error updating repository');
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook listener running on port ${PORT}`);
});

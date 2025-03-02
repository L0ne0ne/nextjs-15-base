const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');
const fs = require('fs');
const chalk = require('chalk').default;

const app = express();
const PORT = 5000;
const APP_DIR = '..'; // Path to your Next.js project
const LOCK_FILE = `${APP_DIR}/.initialized`; // Used to track first-time setup
const NEXT_APP_NAME = 'nextjs-base'; // PM2 process name

app.use(bodyParser.json());

// 🟢 First-time setup: Install, build, and start the app
if (!fs.existsSync(LOCK_FILE)) {
    console.log(chalk.blue('🔰 First-time setup: Installing and building Next.js...'));

    try {
        execSync(`cd ${APP_DIR} && npm install && npm run build && node copyFiles.js`, {
            stdio: 'inherit'
        });

        // fs.writeFileSync(LOCK_FILE, "initialized"); // Create lock file

        console.log(chalk.green.bold('\n✅ Setup complete! Starting Next.js server...'));

        // Start Next.js app with PM2
        execSync(` pm2 start "../ecosystem.config.js" --name ${NEXT_APP_NAME}`, {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error(chalk.red('\n❌ Setup failed!'));
        console.error(error.stack);
        process.exit(1); // Stop execution if setup fails
    }
} else {
    console.log(chalk.green('🔄 App is already set up. Listening for updates...'));
}

// 🟡 Webhook to handle GitHub push events
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event'];

    if (event !== 'push') {
        console.log(chalk.yellow(`⚠️  Ignored event: ${event}`));
        return res.status(200).send('Event ignored');
    }

    console.log(chalk.blue('\n🚀 Push event received. Pulling latest code...'));

    try {
        execSync(`cd ${APP_DIR} && git pull origin main`, { stdio: 'inherit' });

        console.log(chalk.cyan('📦 Installing dependencies (if needed)...'));
        execSync(`cd ${APP_DIR} && npm install`, { stdio: 'inherit' });

        console.log(chalk.yellow('🔄 Rebuilding Next.js...'));
        execSync(`cd ${APP_DIR} && npm run build && node copyFiles.js`, {
            stdio: 'inherit'
        });

        console.log(chalk.magenta('🔁 Restarting Next.js server with PM2...'));
        execSync(`pm2 restart ${NEXT_APP_NAME}`, { stdio: 'inherit' });

        console.log(chalk.green.bold('\n✅ Deployment successful! 🎉'));
        res.status(200).send('App updated and restarted successfully');
    } catch (error) {
        console.error(chalk.red('\n❌ Deployment failed!'));
        console.error(error.stack);
        res.status(500).send('Error updating app');
    }
});

// 🟢 Start the webhook listener
app.listen(PORT, '0.0.0.0', () => {
    console.log(chalk.green.bold(`📡 Webhook listener running on port ${PORT}`));
});

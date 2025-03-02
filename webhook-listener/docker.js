const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');

(async () => {
    const chalk = (await import('chalk')).default;

    const app = express();
    const PORT = 5000;

    app.use(bodyParser.json());

    app.post('/webhook', (req, res) => {
        const event = req.headers['x-github-event'];

        if (event !== 'push') {
            console.log(chalk.yellow(`⚠️  Ignored event: ${event}`));
            return res.status(200).send('Event ignored');
        }

        console.log(chalk.blue('\n========================================'));
        console.log(chalk.blue.bold('🚀 Push event received. Starting deployment...'));
        console.log(chalk.blue('========================================\n'));

        try {
            console.log(chalk.cyan('🔄 Resetting repository...'));
            execSync('cd .. && git reset --hard', { stdio: 'inherit' });

            console.log(chalk.cyan('📥 Pulling latest code from GitHub...'));
            execSync('cd .. && git pull origin main', { stdio: 'inherit' });

            console.log(chalk.cyan('🐳 Building new Docker image...'));
            execSync('cd .. && docker build -t nextjs-app .', { stdio: 'inherit' });

            console.log(chalk.yellow('🛑 Stopping existing container (if running)...'));
            execSync('docker stop nextjs-container || true', { stdio: 'inherit' });

            console.log(chalk.yellow('🗑️ Removing old container...'));
            execSync('docker rm nextjs-container || true', { stdio: 'inherit' });

            console.log(chalk.green('🚀 Starting new container...'));
            execSync('cd .. && docker run -d -p 3000:3000 --name nextjs-container nextjs-app', { stdio: 'inherit' });

            console.log(chalk.green.bold('\n✅ Deployment successful! 🎉'));
            res.status(200).send('Repository updated and app restarted successfully');
        } catch (error) {
            console.error(chalk.red('\n❌ Docker deployment failed!'));
            console.error(chalk.red(error.stack));
            res.status(500).send('Error updating repository');
        }
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(chalk.green.bold(`📡 Webhook listener running on port ${PORT}`));
    });
})();

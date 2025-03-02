module.exports = {
    apps: [
        {
            name: 'nextjs-base',
            script: 'server.js',
            cwd: '../.next/standalone',
            env: {
                PORT: 8080
            }
        }
    ]
};

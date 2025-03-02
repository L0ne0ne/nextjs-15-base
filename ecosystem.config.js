module.exports = {
    apps: [
        {
            name: 'nextjs-base',
            script: 'server.js',
            cwd: '../nextjs-15-base/.next/standalone',
            env: {
                PORT: 8080
            }
        }
    ]
};

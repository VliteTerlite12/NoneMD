module.exports = {
    apps: [{
        name: "bot_wa",
        script: "./index.js",
        interpreter: "/root/.bun/bin/bun",
        cwd: "/root/wa-bussines/",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        error: '/root/wa-bussines/logs/error.log',
    }]
};
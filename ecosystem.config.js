module.exports = {
    apps : [
        {
            name: "worker-production",
            script: "./dist/index.js",
            instances: "1",
            exec_mode: "cluster",
            log_date_format: "YYYY-MM-DD HH:mm:ss:SSS Z",
            error_file: "./logs/pm2-error-production.log",
            out_file: "./logs/pm2-out-production.log",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
        {
            name: "worker-staging",
            script: "./dist/index.js",
            instances: "1",
            exec_mode: "cluster",
            log_date_format: "YYYY-MM-DD HH:mm:ss:SSS Z",
            error_file: "./logs/pm2-error-staging.log",
            out_file: "./logs/pm2-out-staging.log",
            env: {
                NODE_ENV: "staging",
                PORT: 3001,
            },
        },
        {
            name: "worker-development",
            script: "./dist/index.js",
            instances: "1",
            exec_mode: "cluster",
            log_date_format: "YYYY-MM-DD HH:mm:ss:SSS Z",
            error_file: "./logs/pm2-error-development.log",
            out_file: "./logs/pm2-out-development.log",
            env: {
                NODE_ENV: "development",
                PORT: 3002,
            },
        }
    ]
}
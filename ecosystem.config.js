module.exports = {
    apps : [
        {
            name: "worker",
            script: "./dist/index.js",
            instances: "1",
            exec_mode: "cluster",
            log_date_format: "YYYY-MM-DD HH:mm:ss:SSS Z",
            error_file: "./logs/pm2-error.log",
            out_file: "./logs/pm2-out.log",
        }
    ]
}
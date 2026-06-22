import dotenv from 'dotenv'
dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  database: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'scheduler_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00',
  },
  workerUrl: process.env.WORKER_URL,
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS, 10) || 1,
  propnexAppKey: process.env.PROPNEX_APP_KEY,
}

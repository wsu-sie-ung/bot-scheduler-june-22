import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import config from '../config'

const LOG_PATH = path.join(__dirname, '../../logs')

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  if (typeof message === 'object') message = JSON.stringify(message)
  return `${timestamp} ${level}: ${message}`
})

const transports = [
  new DailyRotateFile({
    filename: path.join(LOG_PATH, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  new DailyRotateFile({
    filename: path.join(LOG_PATH, 'out-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
]

if (config.env !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat
      ),
    })
  )
}

export const logger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(winston.format.timestamp(), customFormat),
  transports: transports,
})

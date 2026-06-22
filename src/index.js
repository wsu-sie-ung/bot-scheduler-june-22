//application entry point
import app from './app'
import config from './config'
import { logger } from './lib/Logger'
import cronService from './services/cron' //importing scheduler
import db from './models'

// Connect to Database
db.sequelize
  .authenticate()
  .then(() => {
    logger.info('Connected to SQL database')
    cronService.init() //start scheduler
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err)
    process.exit(1)
  })

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`)
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})

import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import config from './config'
import { errorHandler } from './middleware/errorHandler'
import { loggerMiddleware } from './middleware/loggerMiddleware'
import routes from './routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (config.env !== 'production' && config.env !== 'test') {
  app.use(morgan('dev'))
}

app.use(loggerMiddleware)

// API routes
app.use('/', routes)

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.statusCode = 404
  next(error)
})

app.use(errorHandler)

export default app

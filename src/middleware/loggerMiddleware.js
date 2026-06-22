import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../lib/Logger'

function isJSONString(text) {
  try {
    JSON.parse(text)
    return true
  } catch (err) {
    return false
  }
}

export const loggerMiddleware = (req, res, next) => {
  req.id = uuidv4() // Assign a unique ID to the request if not already present

  logger.info({
    tag: `API_REQUEST`,
    requestId: req.id,
    hostname: req.hostname,
    method: req.method,
    url: req.originalUrl,
    data: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    headers: req.headers,
    cookies: req.cookies,
    time: moment().utcOffset(480).format(`YYYY-MM-DD HH:mm:ss:SSS Z`),
  })

  const originalSend = res.send
  res.send = (data) => {
    // If data is an object (and not a Buffer), Express will call res.json,
    // which will call res.send again with a string.
    if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
      return originalSend.call(res, data)
    }

    let logData = data
    if (typeof data === 'string' && isJSONString(data)) {
      logData = JSON.parse(data)
    }

    logger.info({
      tag: `API_RESPONSE`,
      requestId: req.id,
      hostname: req.hostname,
      method: req.method,
      url: req.originalUrl,
      data: logData,
      headers: res.getHeaders(), // Use getHeaders() for response headers
      cookies: res.cookies, // Note: res.cookies might not be populated by default unless set
      time: moment().utcOffset(480).format(`YYYY-MM-DD HH:mm:ss:SSS Z`),
    })

    originalSend.call(res, data)
  }
  next()
}

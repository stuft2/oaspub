import {Middleware} from './middleware'
import debug from 'debug'

const logger = debug('api:server')

export const Logger: Middleware = (req, res, next) => {
  logger(`%s %s ?=%O`, req.method, req.originalUrl, req.query)
  // logger('Body:', JSON.stringify(req.body)) // body could contain sensitive data
  next()
}

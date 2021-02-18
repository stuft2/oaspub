import {NextFunction, Request, Response} from "express"
import debug from 'debug'

const logger = debug('api:server')

export function Logger (req: Request, res: Response, next: NextFunction): void {
  logger(`%s %s ?=%O`, req.method, req.originalUrl, req.query)
  // logger('Body:', JSON.stringify(req.body)) // body could contain sensitive data
  next()
}

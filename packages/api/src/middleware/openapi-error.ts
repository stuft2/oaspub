import {Request, Response, NextFunction} from 'express'
import debug from 'debug'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'

const logger = debug('api:enforcer')

// TODO - Add better type definitions when openapi enforcer adds them
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EnforcerError (err: Error & { exception: { header: string } }, req: Request, res: Response, next: NextFunction): void {
  if (err && err.exception && err.exception.header === 'Request has one or more errors') {
    res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.message.split('\n')))
    return next()
  }
  logger('%O', err.stack)
  res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
  return next()
}

import {Request, Response, NextFunction} from 'express'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'

// TODO - Add better type definitions when openapi enforcer adds them
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EnforcerError (err: Error & { exception: any }, req: Request, res: Response, next: NextFunction): any {
  if (err && err.exception && err.exception.header === 'Request has one or more errors') {
    return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.message.split('\n')))
  }
  console.error(err.stack)
  return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
}

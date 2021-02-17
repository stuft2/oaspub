import {Request, Response, NextFunction} from 'express'
import debug from 'debug'
import get from 'lodash.get'
import {generateMetadataResponseObj, HttpStatus, ValidationError} from '../util/uapi'
import {MongoWriteConcernError} from "mongodb"

const logger = debug('api:enforcer')

interface EnforcerException extends Error {
  exception: {
    header: string
  }
}

function isEnforcerValidationException (value: unknown): value is EnforcerException {
  return get(value, 'exception.header') === 'Request has one or more errors'
}

export function EnforcerError (err: Error, req: Request, res: Response, next: NextFunction): unknown {
  if (isEnforcerValidationException(err)) {
    return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.message.split('\n')))
  }
  if (err instanceof ValidationError) {
    return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.errors))
  }
  logger('An unexpected error occurred while processing the request: %O', err)
  return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
}

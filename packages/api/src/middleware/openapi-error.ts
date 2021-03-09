import {ErrorRequestHandler} from 'express'
import debug from 'debug'
import get from 'lodash.get'
import {generateMetadataResponseObj, HttpStatus, ValidationError} from '../util/uapi'

const logger = debug('api:server')

function isEnforcerValidationException (value: unknown): boolean {
  return get(value, 'exception.header') === 'Request has one or more errors'
}

export const EnforcerError: ErrorRequestHandler = (err, req, res, next) => {
  if (isEnforcerValidationException(err)) {
    return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.message.split('\n')))
  }
  if (err instanceof ValidationError) {
    return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, err.errors))
  }
  logger('An unexpected error occurred while processing the request: %O', err)
  return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
}

import {Request, Response} from 'express'
import {Db, MongoWriteConcernError} from 'mongodb'
import {Account} from '../db/models'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import debug from 'debug'

const logger = debug('api:controller:account')

export = function (db: Db): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async create (req: Request, res: Response) {
      try {
        const account = Account.fromJson(req.body)
        const {ops} = await db.collection<Account>(Account.name).insertOne(account)
        // TODO - finish handling ops
        return res.send('OK')
      } catch (e) {
        if (e instanceof TypeError) {
          return res.status(HttpStatus.BAD_REQUEST).send(generateMetadataResponseObj(HttpStatus.BAD_REQUEST, undefined, e.message.split('\n')))
        }
        if (e instanceof MongoWriteConcernError) {
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        logger('An unexpected error occurred while processing the request: %O', e)
        return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
      }
    },
    async retrieve (req: Request, res: Response) {

    },
    async update (req: Request, res: Response) {

    },
    async deactivate (req: Request, res: Response) {

    }
  }
}

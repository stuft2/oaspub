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
        const {ops: [result]} = await db.collection<Account>(Account.name).insertOne(account)
        return res.status(HttpStatus.CREATED).send({
          ...new Account(result).toJson(),
          ...generateMetadataResponseObj(HttpStatus.CREATED)
        })
      } catch (err) {
        if (err instanceof MongoWriteConcernError) {
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async retrieve (req: Request, res: Response) {
      const _id = req.params.accountId
      const account = await db.collection<Account>(Account.name).findOne({_id})
      if (!account) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
      return res.send({
        ...new Account(account).toJson(),
        ...generateMetadataResponseObj(HttpStatus.SUCCESS)
      })
    },
    async update (req: Request, res: Response) {
      try {
        const _id = req.params.accountId
        const account = Account.fromJson(req.body)
        const {value} = await db.collection<Account>(Account.name).findOneAndUpdate({_id}, account)
        if (!value) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
        return res.send({
          ...new Account(value).toJson(),
          ...generateMetadataResponseObj(HttpStatus.SUCCESS)
        })
      } catch (err) {
        if (err instanceof MongoWriteConcernError) {
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async deactivate (req: Request, res: Response) {
      const _id = req.params.accountId
      await db.collection<Account>(Account.name).findOneAndDelete({_id})
      return res.status(HttpStatus.NO_CONTENT).send()
    }
  }
}

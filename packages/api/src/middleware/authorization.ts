import {Middleware} from './middleware'
import {Db} from 'mongodb'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {EnvConfiguration} from '../util/env'
import {Account} from '../db/models'
import {Request} from 'express'

type SelfServicePredicate = (req: Request) => Promise<string | undefined>

export class SelfService {
  private readonly env: EnvConfiguration
  private readonly db: Db
  constructor(env: EnvConfiguration, db: Db) {
    this.env = env
    this.db = db
  }
  middleware = (predicate: SelfServicePredicate): Middleware => {
    return async (req, res, next) => {
      if (!req.account) {
        return res.status(HttpStatus.FORBIDDEN).send(generateMetadataResponseObj(HttpStatus.FORBIDDEN))
      }

      const result = await predicate(req)
      if (result !== req.account.sub) {
        return res.status(HttpStatus.FORBIDDEN).send(generateMetadataResponseObj(HttpStatus.FORBIDDEN))
      }

      return next()
    }
  }

  // Verifies the username associated with an account request
  account: SelfServicePredicate = async (req) => {
    const {username} = req.params
    const account = await Account.fetch(this.db, {username}, null)
    return account?.data.username
  }
}

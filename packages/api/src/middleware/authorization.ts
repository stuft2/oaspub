import {Db} from 'mongodb'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {EnvConfiguration} from '../util/env'
import {Account} from '../db/models'
import {Request, RequestHandler} from 'express'

export type AuthorizationPredicate = (req: Request) => Promise<boolean>

export class Authorization {
  private readonly env: EnvConfiguration
  private readonly db: Db
  constructor(env: EnvConfiguration, db: Db) {
    this.env = env
    this.db = db
  }

  middleware: RequestHandler = async (req, res, next) => {
    const authorizations = await Promise.all(req.auth.roles.map(async role => {
      const predicate = this.predicates[role]
      if (predicate) {
        return await predicate(req)
      }
      return true
    }))

    const isAuthorized = authorizations.some(satisfied => satisfied)
    if (!isAuthorized) {
      return res.status(HttpStatus.FORBIDDEN).send(generateMetadataResponseObj(HttpStatus.FORBIDDEN))
    }

    return next()
  }

  // No authorization required
  viewer: AuthorizationPredicate = async () => {
    return true
  }

  // Verifies that the username path parameter is the same as the requester
  self: AuthorizationPredicate = async (req) => {
    // The authenticated entity is set in the authentication middleware
    // See ./authentication.ts#middleware
    if (!req.auth.entity) return false

    // Get username and fetch account information
    const username = req.params.username
    const account = await Account.fetch(this.db, {username}, null)

    // Verify the account exists and the username matches the subject
    return account?.data.username === req.auth.entity.sub
  }

  // Verifies the owner of the resource is the requester
  owner: AuthorizationPredicate = async (req) => {
    return true
  }

  // Verifies the maintainer of the resource is the requester
  maintainer: AuthorizationPredicate = async (req) => {
    return true
  }

  // Verifies the token
  app: AuthorizationPredicate = async (req) => {
    return true
  }

  predicates: Record<string, AuthorizationPredicate> = {
    viewer: this.viewer,
    self: this.self,
    owner: this.owner,
    maintainer: this.maintainer,
    app: this.app
  }
}

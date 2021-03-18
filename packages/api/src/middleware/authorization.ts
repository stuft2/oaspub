import {Db} from 'mongodb'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {EnvConfiguration} from '../util/env'
import {Account, Token, Document} from '../db/models'
import {Request, RequestHandler} from 'express'
import {Contributor, Role } from '../db/models/contributor'

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
  viewer: AuthorizationPredicate = async (req) => {
    // Check if the operation requires authorization
    return req.operation.security != null && req.operation.security.length > 0
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
    // The authenticated entity is set in the authentication middleware
    // See ./authentication.ts#middleware
    if (!req.auth.entity) return false

    // Get resource name and id from the path
    const pathSegments = req.path.split('/')
    if (!pathSegments) return false

    const [,resourceName,resourceId] = pathSegments
    const username = req.auth.entity.sub

    // Fetch the resource owner depending on the resource name
    switch (resourceName) {
      case 'tokens': {
        const token = Token.fetch(this.db, {username, _id: resourceId})
        return token != null
      }
      case 'documents': {
        const [document] = await Document.list(this.db, {title: resourceId}, 1, 0)
        const owners = await Contributor.list(this.db, {document: resourceId, role: Role.OWNER}, 1, 0)
        return owners.find(owner => owner.username === username) !== null
      }
    }
    return false
  }

  // Verifies the maintainer of the resource is the requester
  maintainer: AuthorizationPredicate = async (req) => {
    // The authenticated entity is set in the authentication middleware
    // See ./authentication.ts#middleware
    if (!req.auth.entity) return false

    // Get resource name and id from the path
    const pathSegments = req.path.split('/')
    if (!pathSegments) return false

    const [,resourceName,resourceId] = pathSegments
    const username = req.auth.entity.sub

    // Fetch the resource maintainer depending on the resource name
    switch (resourceName) {
      case 'documents': {
        const [document] = await Document.list(this.db, {title: resourceId}, 1, 0)
        const maintainers = await Contributor.list(this.db, {document: resourceId, role: Role.MAINTAINER}, 1, 0)
        return maintainers.find(maintainer => maintainer.username === username) !== null
      }
    }
    return false
  }

  // An app token doesn't grant any authorizations
  app: AuthorizationPredicate = async () => {
    return false
  }

  predicates: Record<string, AuthorizationPredicate> = {
    viewer: this.viewer,
    self: this.self,
    owner: this.owner,
    maintainer: this.maintainer,
    app: this.app
  }
}

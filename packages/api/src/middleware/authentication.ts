import {EnvConfiguration} from '../util/env'
import {Session, SessionPayload} from '../db/models/session'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {Request, RequestHandler} from 'express'
import debug from 'debug'
import {TokenExpiredError} from 'jsonwebtoken'
import {OpenAPIV3} from 'openapi-types'
import SecuritySchemeObject = OpenAPIV3.SecuritySchemeObject
import HttpSecurityScheme = OpenAPIV3.HttpSecurityScheme
import {Account} from "../db/models"
import {Db} from "mongodb"

export interface RequestAuthentication {
  auth: {
    entity?: SessionPayload
    roles: string[]
  }
}

// Note: returning promises because future authentication methods may be asynchronous though some are synchronous
export type SecuritySchemeHandler = (req: Request, role: string, securitySchemeObject: SecuritySchemeObject) => Promise<boolean>
export type HttpSecuritySchemeHandler = (req: Request, role: string, securitySchemeObject: HttpSecurityScheme) => Promise<boolean>

const logger = debug('api:authentication')

export class Authentication {
  private readonly env: EnvConfiguration
  private readonly db: Db
  private readonly securitySchemes: SecuritySchemes
  constructor(env: EnvConfiguration, db: Db) {
    this.env = env
    this.db = db
    this.securitySchemes = new SecuritySchemes(env, db)
  }

  middleware: RequestHandler = async (req, res, next) => {
    // Setup authentication on request object
    req.auth = { roles: [] }

    // Check security requirements
    try {
      const securityRequirements = req.operation.security
      if (!securityRequirements) {
        req.auth.roles.push('viewer')
        return next()
      }
      const requirements = await Promise.all(securityRequirements.map(async requirement => {
        const authentications = await Promise.all(Object.entries(requirement).map(async ([role]) => {
          // TODO - Remove type conversion when OpenAPI enforcer provides types
          // Docs: https://github.com/byu-oit/openapi-enforcer/discussions/107
          const securitySchemeObject = req.openapi?.components?.securitySchemes?.[role] as SecuritySchemeObject
          if (!securitySchemeObject) {
            logger(`No security schema object found with name: "${role}"`)
            return
          }

          // Currently only supporting 'http' security scheme
          const schemeHandler = this.securitySchemes.handlers[securitySchemeObject.type]
          if (!schemeHandler) {
            logger(`Unsupported security scheme type: "${securitySchemeObject.type}"`)
            return
          }
          return schemeHandler(req, role, securitySchemeObject)
        }))
        // At least one of the authentication methods must be satisfied
        return authentications.some(authenticated => authenticated)
      }))
      // All security requirements must be satisfied
      const authenticated = requirements.every(satisfied => satisfied)
      if (!authenticated) {
        return res.status(HttpStatus.UNAUTHORIZED).send(generateMetadataResponseObj(HttpStatus.UNAUTHORIZED))
      }
      return next()
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        return res.status(HttpStatus.UNAUTHORIZED).send(generateMetadataResponseObj(HttpStatus.UNAUTHORIZED, e.message))
      }
      // Print stack trace to track errors
      console.error(e.stack)
      return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
    }
  }
}

export class SecuritySchemes {
  private readonly env: EnvConfiguration
  private readonly db: Db
  private readonly httpSecuritySchemes: HttpSecuritySchemes
  constructor(env: EnvConfiguration, db: Db) {
    this.env = env
    this.db = db
    this.httpSecuritySchemes = new HttpSecuritySchemes(env, db)
  }

  http: SecuritySchemeHandler = async (req, role, httpSecurityScheme) => {
    // Verify http security scheme
    if (httpSecurityScheme.type !== 'http') {
      logger('Type of security scheme must be "http"')
      return false
    }

    // OpenAPI supports all http security schemes in the IANA Authentication Scheme registry.
    // Docs: https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
    const {scheme} = httpSecurityScheme
    const httpSecuritySchemeHandler = this.httpSecuritySchemes.handlers[scheme]

    // Report http security schemes that the OpenAPI doc defines but that isn't support
    if (!httpSecuritySchemeHandler) {
      logger(`Unknown HTTP authorization scheme: "${scheme}"`)
      return false
    }
    return httpSecuritySchemeHandler(req, role, httpSecurityScheme)
  }

  handlers: Record<string, SecuritySchemeHandler> = {
    http: this.http
  }
}

export class HttpSecuritySchemes {
  private readonly env: EnvConfiguration
  private readonly db: Db
  private readonly session: Session
  constructor(env: EnvConfiguration, db: Db) {
    this.env = env
    this.db = db
    this.session = new Session(env.server.privateKey)
  }

  bearer: HttpSecuritySchemeHandler = async (req, role, {scheme, bearerFormat}) => {
    // Verify bearer scheme since no other http auth scheme is supported
    if (scheme !== 'bearer') {
      logger('Scheme of http security scheme must be "bearer"')
      return false
    }

    // The authorization header must be defined if the route specifies an HTTP security scheme
    const { authorization } = req.headers
    if (!authorization) {
      logger('No authorization header found')
      return false
    }

    // OpenAPI doc SHOULD provide regex that identifies the bearer token for documentation purposes
    // This is here just in case it isn't provided
    const defaultBearerRx = /^[Bb]earer +([a-zA-Z0-9+/=._-]+)$/

    // First match will be the match of the entire authorization header, second will be the token
    const [, token] = authorization.match(new RegExp(bearerFormat || defaultBearerRx)) || []
    if (!token) {
      return false
    }

    // Decode and validate token
    const verified = this.session.verify(token)

    // Explicitly check for active account with the subject's username
    const active = verified ? await Account.fetch(this.db, {username: verified.sub}, true) : null

    // Set the auth entity and roles if request token is verified and associated with an active account
    if (verified && active) {
      req.auth.entity = verified
      req.auth.roles.push(role)
    }

    // Indicate authentication result
    return !!verified && !!active
  }

  handlers: Record<string, HttpSecuritySchemeHandler> = {
    bearer: this.bearer
  }
}

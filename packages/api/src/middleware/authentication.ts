import {Middleware} from './middleware'
import {EnvConfiguration} from '../util/env'
import {Session} from '../db/models/session'

export function authenticate ({server}: EnvConfiguration): Middleware  {
  const session = new Session(server.privateKey)
  return async function (req, res, next) {
    const { authorization } = req.headers
    if (!authorization) return next()

    const token = authorization.replace(/^Bearer\w+/, '')
    const verified = await session.verify(token)
    if (!verified) return next()

    req.account = verified
    return next()
  }
}

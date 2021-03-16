import * as jwt from 'jsonwebtoken'
import {SignOptions} from "jsonwebtoken"
import * as env from '../../util/env'

export type SessionCreateRequest = {
  username: string
  password: string
} | {
  email: string
  password: string
}

export type SessionPayload = {
  iss: string,
  exp: number,
  iat: number,
  sub: string,
  email: string
}

export type SessionResponse = {
  token: string
}

export class Session {
  private readonly secret: string
  private readonly options: SignOptions
  private readonly duration = '1h'
  constructor(secret: string, options?: SignOptions) {
    const {server} = env.get()
    this.secret = secret
    this.options = {
      expiresIn: this.duration,
      issuer: server.host,
      ...options
    }
  }

  sign(payload: Omit<SessionPayload, 'iss' | 'exp' | 'iat'>): SessionResponse {
    const token = jwt.sign(payload, this.secret, this.options)
    return {token}
  }

  verify(token: string): SessionPayload | null {
    return jwt.verify(token, this.secret, {
      issuer: this.options.issuer,
      maxAge: this.duration
    }) as SessionPayload
  }
}


import {SessionPayload} from '../db/models/session'

module 'express' {
  export interface Request {
    account?: SessionPayload
  }
}

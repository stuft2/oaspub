import * as oas from '../../openapi.json'
import {ajv} from '../../util/ajv'
import {ValidationError} from '../../util/uapi'

const validate = ajv.compile<TokenModel>(oas.components.schemas.token)

export interface TokenModel {
  description: string
  lastUsed: LastUsed
  token?: string
}

export interface LastUsed {
  location: string
  dateTime: Date
}

export class Token implements TokenModel {
  description: string
  lastUsed: {
    location: string
    dateTime: Date
  }
  token?: string

  constructor(obj: TokenModel) {
    this.description = obj.description
    this.lastUsed = obj.lastUsed
    if (obj.token) this.token = obj.token
  }

  static fromJson (obj: unknown) {
    if (!Token.isAccount(obj)) throw new ValidationError(validate.errors?.slice()) // Copy errors
    return new Token(obj)
  }

  static isAccount (value: unknown): value is TokenModel {
    return validate(value)
  }
}

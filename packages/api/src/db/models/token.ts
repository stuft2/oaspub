import Ajv from 'ajv'
import * as oas from '../../openapi.json'

const validate = new Ajv().compile<TokenModel>(oas.components.schemas.token)

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
    if (!Token.isAccount(obj)) throw TypeError(validate.errors?.join('\n'))
    return new Token(obj)
  }

  static isAccount (value: unknown): value is TokenModel {
    return validate(value)
  }
}

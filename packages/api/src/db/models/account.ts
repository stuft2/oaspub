import Ajv from 'ajv'
import * as oas from '../../openapi.json'

const validate = new Ajv().compile<AccountModel>(oas.components.schemas.account)

export interface AccountModel {
  username: string
  email: string
  password?: string
}

export class Account implements AccountModel {
  username: string
  email: string
  password?: string

  constructor(username: string, email: string, password?: string) {
    this.username = username
    this.email = email
    if (password) this.password = password
  }

  static fromJson (obj: unknown) {
    if (!Account.isAccount(obj)) throw TypeError(validate.errors?.join('\n'))
    return new Account(obj.username, obj.email, obj.password)
  }

  static isAccount (value: unknown): value is AccountModel {
    return validate(value)
  }
}

import {ajv} from '../../util/ajv'
import * as oas from '../../openapi.json'

const validate = ajv.compile<AccountModel>(oas.components.schemas.account)

export interface AccountModel {
  username: string
  email: string
  password?: string
}

export class Account implements AccountModel {
  username: string
  email: string
  password?: string

  constructor(obj: AccountModel) {
    this.username = obj.username
    this.email = obj.email
    this.password = obj.password
  }

  static isAccount (value: unknown): value is AccountModel {
    return validate(value)
  }

  static fromJson (obj: unknown, partial = false) {
    if (!Account.isAccount(obj)) throw TypeError(validate.errors?.join('\n'))
    return new Account(obj)
  }

  toJson () {
    return {username: this.username, email: this.email}
  }
}

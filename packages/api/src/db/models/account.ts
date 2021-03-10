import {Db} from 'mongodb'
import {Debugger} from 'debug'
import { v4 as uuid } from 'uuid'
import * as crypto from 'crypto'
import {Session, SessionPayload} from "./session"

export interface AccountModel {
  _id: string
  username: string
  email: string
  password: Password
  active: boolean
  token?: string
}

export interface Password {
  value: string
  _salt: string
}

export type AccountCreateRequest = {
  username: string
  email: string
  password: string
}

export type AccountUpdateRequest = Partial<AccountCreateRequest>

export type AccountResponse = Omit<AccountModel, '_id' | '_salt' | 'password' | 'active'>

export class Account {
  data: AccountModel

  constructor(account: AccountModel) {
    this.data = account
  }

  static collection (db: Db) {
    return db.collection<AccountModel>(Account.name)
  }

  static async initialize (db: Db, logger: Debugger) {
    // Ensure collection exists
    const collectionName = Account.name
    const collections = await db.collections()
    if (collections.some(collection => collection.collectionName === collectionName)) {
      logger('Collection %s already exists', collectionName)
      return
    }
    await db.createCollection(collectionName)
    logger('Created collection %s', collectionName)

    // Ensure indexes exist
    const collection = db.collection(collectionName)
    await collection.createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true }
    ])
    logger('Created indexes for collection %s', collectionName)
  }

  info (): Omit<AccountModel, '_id' | '_salt' | 'password' | 'active'> {
    const {_id, password, active, ...readable} = this.data
    return readable
  }

  claims (): Omit<SessionPayload, 'iss' | 'iat' | 'exp'> {
    return { sub: this.data.username }
  }

  verify (password: string): boolean {
    return Account.encryptPassword(password, this.data.password._salt).value === this.data.password.value
  }

  static encryptPassword (password: string, salt?: string): Password {
    const _salt = salt || crypto.randomBytes(16).toString('hex')
    const value = crypto.pbkdf2Sync(password, _salt, 1000, 64, 'sha512').toString('hex')
    return {value, _salt}
  }

  static async create (db: Db, {password: pwd, ...account}: AccountCreateRequest): Promise<Account> {
    const _id = uuid()
    const password = Account.encryptPassword(pwd)
    const {ops: [result]} = await Account.collection(db).insertOne({...account, password, _id, active: true})
    return new Account(result)
  }

  static async update(db: Db, username: string, {password, ...fields}: AccountUpdateRequest): Promise<Account | null> {
    let updates: Partial<AccountModel> = fields
    if (password) {
      const encrypted = Account.encryptPassword(password)
      updates = {...updates, ...encrypted}
    }
    const result = await Account.collection(db).findOneAndUpdate({username, active: true}, { $set: updates }, {returnOriginal: false})
    return result.value ? new Account(result.value) : null
  }

  static async fetch (db: Db, filters: Partial<Pick<AccountModel, '_id' | 'username' | 'email'>>, active: boolean | null = true): Promise<Account | null> {
    const result = await Account.collection(db).findOne({...filters, ...active !== null && { active }})
    return result ? new Account(result) : null
  }

  static async deactivate(db: Db, username: string): Promise<void> {
    await Account.collection(db).findOneAndUpdate({username}, { $set: { active: false } })
  }

  static async activate(db: Db, username: string): Promise<void> {
    await Account.collection(db).findOneAndUpdate({username}, { $set: { active: true } })
  }
}

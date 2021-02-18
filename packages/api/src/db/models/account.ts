import {Db} from 'mongodb'
import {Debugger} from 'debug'
import { v4 as uuid } from 'uuid'
import * as crypto from 'crypto'

export type AccountCreateRequest = {
  username: string
  email: string
  password: string
}

export type AccountUpdateRequest = {
  username?: string
  email?: string
  password?: string
}

export interface AccountModel {
  _id: string
  username: string
  email: string
  password: Password
  active: boolean
}

export interface Password {
  value: string
  _salt: string
}

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

  readable (): Omit<AccountModel, '_id' | '_salt' | 'password' | 'active'> {
    const {_id, password, active, ...readable} = this.data
    return readable
  }

  static encryptPassword (password: string): Pick<AccountModel, 'password'> {
    const _salt = crypto.randomBytes(16).toString('hex')
    password = crypto.pbkdf2Sync(password, _salt, 1000, 64, 'sha512').toString('hex')
    return {
      password: {
        value: password,
        _salt
      }
    }
  }

  static async create (db: Db, {password, ...account}: AccountCreateRequest): Promise<Account> {
    const _id = uuid()
    const encrypted = Account.encryptPassword(password)
    const {ops: [result]} = await Account.collection(db).insertOne({...account, ...encrypted, _id, active: true})
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

  static async fetch (db: Db, filters: Partial<Pick<AccountModel, '_id' | 'username' | 'email'>>): Promise<Account | null> {
    const result = await Account.collection(db).findOne({...filters, active: true})
    return result ? new Account(result) : result
  }

  static async deactivate(db: Db, username: string): Promise<void> {
    await Account.collection(db).findOneAndUpdate({username}, { $set: { active: false } })
  }
}

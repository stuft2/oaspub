import {Collection, Db} from 'mongodb'
import {Debugger} from 'debug'
import {v4 as uuid} from 'uuid'

export interface TokenModel {
  _id: string
  username: string
  description: string
  lastUsed: number // Linux epoch time
  token?: string
}

export type TokenCreateRequest = {
  username: string
  description: string
}

export class Token {
  data: TokenModel

  constructor(token: TokenModel) {
    this.data = token
  }

  static from (token: TokenModel): Token {
    return new Token(token)
  }

  static collection (db: Db): Collection<TokenModel> {
    return db.collection<TokenModel>(Token.name)
  }

  static async initialize (db: Db, logger: Debugger): Promise<void> {
    // Ensure collection exists
    const collectionName = Token.name
    const collections = await db.collections()
    if (collections.some(collection => collection.collectionName === collectionName)) {
      logger('Collection %s already exists', collectionName)
      return
    }
    await db.createCollection(collectionName)
    logger('Created collection %s', collectionName)

    // Ensure indexes exist
    logger('No indexes to create for collection %s', collectionName)
  }

  info (first = false): TokenModel {
    const {token, ...readable} = this.data
    return first ? {token, ...readable} : readable
  }

  static async count (db: Db, query: Pick<TokenModel, 'username'>): Promise<number> {
    return await Token.collection(db).countDocuments(query)
  }

  static async list (db: Db, query: Pick<TokenModel, 'username'>, limit: number, offset: number): Promise<Token[]> {
    const tokens = await Token.collection(db).find(query, {
      sort: { lastUsed: 1 },
      skip: offset,
      limit,
    }).toArray()
    return tokens.map(token => Token.from(token))
  }

  static async generate (db: Db, request: TokenCreateRequest): Promise<Token> {
    const _id = uuid()
    const token = uuid()
    const lastUsed = Date.now()
    const {ops: [result]} = await Token.collection(db).insertOne({
      ...request,
      _id,
      token,
      lastUsed
    })
    return Token.from(result)
  }

  static async revoke (db: Db, filter: Pick<TokenModel, 'username' | '_id'>): Promise<void> {
    await Token.collection(db).findOneAndDelete(filter)
  }
}

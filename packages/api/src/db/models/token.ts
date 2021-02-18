import {ValidationError} from '../../util/uapi'
import {Db} from 'mongodb'
import {Debugger} from 'debug'

export interface TokenModel {
  _id: string
  description: string
  lastUsed: LastUsed
  token?: string
}

export interface LastUsed {
  location: string
  dateTime: Date
}

export class Token {
  data: TokenModel

  constructor(token: TokenModel) {
    this.data = token
  }

  static async initialize (db: Db, logger: Debugger) {
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
}

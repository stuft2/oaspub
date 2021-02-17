import debug from 'debug'
import {Db, MongoClient} from 'mongodb'
import * as env from '../util/env'
import {Account, Document, Token} from './models'

const logger = debug('api:db')

const {db} = env.get()
const uri = `mongodb://${encodeURIComponent(db.username)}:${encodeURIComponent(db.password)}@${db.host}:${db.port}`

export async function connect (): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    useUnifiedTopology: true // Clears Server Discover and Monitoring engine deprecation warning
  })

  try {
    // Connect the client to the server
    await client.connect()

    // Establish and verify connection
    await client.db('admin').command({ping: 1})
    logger('Connected successfully to database server')

    return client
  } catch (e) {
    await client.close() // Ensure client closes on error
    throw e
  }
}

export async function initialize (): Promise<Db> {
  const client = await connect()
  const db = client.db('documents')

  const models = [Account, Document, Token]

  const collections = await db.collections()

  await Promise.all(models.map(async model => {
    const collectionName = model.name.toLowerCase()
    if (collections.every(collection => collection.collectionName !== collectionName)) {
      await db.createCollection(collectionName)
      logger('Created collection %s', collectionName)
      return
    }
    logger('Collection %s already exists', collectionName)
  }))

  return db
}

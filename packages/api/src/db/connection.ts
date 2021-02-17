import debug from 'debug'
import {Db, MongoClient} from 'mongodb'
import * as env from '../util/env'
import {Account} from './models'

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

  const models: {name: string}[] = [
    Account
  ]

  for (const model of models) {
    await db.createCollection(model.name)
  }

  return db
}

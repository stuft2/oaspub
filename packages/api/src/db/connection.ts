import debug, {Debugger} from 'debug'
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
  const models: { initialize: (db: Db, logger: Debugger) => Promise<void> }[] = [Account, Document, Token]
  await Promise.all(models.map(model => model.initialize(db, logger)))
  return db
}

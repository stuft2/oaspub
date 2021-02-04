import debug from 'debug'
import {MongoClient} from 'mongodb'

const logger = debug('api:db')

export async function connect (): Promise<MongoClient> {
  const uri = ''
  const client = new MongoClient(uri)

  // Connect the client to the server
  await client.connect()

  // Establish and verify connection
  await client.db('admin').command({ ping: 1 })
  logger('Connected successfully to server')

  return client
}

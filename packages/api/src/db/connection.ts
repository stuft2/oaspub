import debug from 'debug'
import {MongoClient} from 'mongodb'

const logger = debug('api:db')

export async function connect (uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri)

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

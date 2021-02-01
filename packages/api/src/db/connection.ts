import {MongoClient} from 'mongodb'

export async function connect () {
  const uri = ''
  const client = new MongoClient(uri)

  // Connect the client to the server
  await client.connect()

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 })
  console.log("Connected successfully to server")

  return client
}

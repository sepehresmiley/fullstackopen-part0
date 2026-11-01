import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from './app.js'

const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } })
await mongoose.connect(mongo.getUri())
const server = app.listen(3006, '127.0.0.1', () => console.log('E2E API ready on port 3006'))

const shutdown = async () => {
  server.close()
  await mongoose.connection.close()
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

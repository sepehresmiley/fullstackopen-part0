import mongoose from 'mongoose'
import app from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'

const start = async () => {
  if (!config.MONGODB_URI) throw new Error('MONGODB_URI is not configured')
  await mongoose.connect(config.MONGODB_URI)
  const server = app.listen(config.PORT, () => logger.info(`Server listening on port ${config.PORT}`))
  return server
}

if (process.env.NODE_ENV !== 'test') start().catch(error => {
  logger.error('Server startup failed:', error.message)
  process.exit(1)
})

export default start

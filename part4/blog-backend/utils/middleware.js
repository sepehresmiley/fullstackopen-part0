import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import config from './config.js'
import logger from './logger.js'

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  request.token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    if (!request.token || !config.SECRET) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const decoded = jwt.verify(request.token, config.SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return response.status(401).json({ error: 'token missing or invalid' })
    request.user = user
    return next()
  } catch {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') return response.status(400).json({ error: 'malformatted id' })
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'username must be unique' })
  }
  logger.error(error.message)
  return next(error)
}

export default { tokenExtractor, userExtractor, unknownEndpoint, errorHandler }

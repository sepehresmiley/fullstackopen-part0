import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import config from '../utils/config.js'

const loginRouter = Router()

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })
  const valid = user && typeof password === 'string'
    ? await bcrypt.compare(password, user.passwordHash)
    : false
  if (!valid) return response.status(401).json({ error: 'invalid username or password' })
  if (!config.SECRET) return response.status(500).json({ error: 'login is not configured' })
  const token = jwt.sign({ username: user.username, id: user._id.toString() }, config.SECRET, { expiresIn: '7d' })
  response.status(200).json({ token, id: user._id.toString(), username: user.username, name: user.name })
})

export default loginRouter

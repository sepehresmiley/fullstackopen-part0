import { Router } from 'express'
import bcrypt from 'bcryptjs'
import Blog from '../models/blog.js'
import User from '../models/user.js'

const usersRouter = Router()

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if (typeof username !== 'string' || username.trim().length < 3) {
    return response.status(400).json({ error: 'username must be at least 3 characters long' })
  }
  if (typeof password !== 'string' || password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username: username.trim(), name, passwordHash, blogs: [] })
  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

usersRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  if (!user) return response.status(404).end()
  await Blog.deleteMany({ user: user._id })
  await User.findByIdAndDelete(user._id)
  response.status(204).end()
})

export default usersRouter

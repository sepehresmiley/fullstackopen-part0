import { Router } from 'express'
import Blog from '../models/blog.js'
import middleware from '../utils/middleware.js'

const blogsRouter = Router()

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
  if (!blog) return response.status(404).end()
  response.json(blog)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = new Blog({ title, author, url, likes, user: request.user._id })
  const savedBlog = await blog.save()
  request.user.blogs.push(savedBlog._id)
  await request.user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { returnDocument: 'after', runValidators: true, context: 'query' },
  )
  if (!blog) return response.status(404).end()
  response.json(blog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).end()
  if (!blog.user || blog.user.toString() !== request.user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }
  await Blog.findByIdAndDelete(blog._id)
  request.user.blogs = request.user.blogs.filter(id => id.toString() !== blog._id.toString())
  await request.user.save()
  response.status(204).end()
})

export default blogsRouter

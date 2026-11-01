import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import supertest from 'supertest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import config from '../utils/config.js'
import Blog from '../models/blog.js'
import User from '../models/user.js'

const api = supertest(app)
const initialBlogs = [
  { title: 'Patterns of Enterprise Application Architecture', author: 'Martin Fowler', url: 'https://martinfowler.com/books/eaa.html', likes: 5 },
  { title: 'Clean Code', author: 'Robert C. Martin', url: 'https://www.oreilly.com/library/view/clean-code/9780136083238/', likes: 12 },
]

let owner
let otherUser
let ownerToken
let otherToken
let mongoServer

const seedUsers = async () => {
  const [ownerHash, otherHash] = await Promise.all([
    bcrypt.hash('owner-password', 8),
    bcrypt.hash('other-password', 8),
  ])
  owner = await User.create({ username: 'owner', name: 'Blog Owner', passwordHash: ownerHash })
  otherUser = await User.create({ username: 'other', name: 'Other User', passwordHash: otherHash })
  ownerToken = jwt.sign({ username: owner.username, id: owner._id.toString() }, config.SECRET)
  otherToken = jwt.sign({ username: otherUser.username, id: otherUser._id.toString() }, config.SECRET)
}

before(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } })
  await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await seedUsers()
  const saved = await Blog.insertMany(initialBlogs.map(blog => ({ ...blog, user: owner._id })))
  owner.blogs = saved.map(blog => blog._id)
  await owner.save()
})

after(async () => {
  await mongoose.connection.close()
  if (mongoServer) await mongoServer.stop()
})

describe('blogs API', () => {
  test('blogs are returned as JSON and use id instead of _id', async () => {
    const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
    assert.equal(response.body.length, initialBlogs.length)
    assert.ok(response.body[0].id)
    assert.equal(Object.hasOwn(response.body[0], '_id'), false)
  })

  test('blog list includes the creator and users list includes their blogs', async () => {
    const blogResponse = await api.get('/api/blogs').expect(200)
    assert.equal(blogResponse.body[0].user.username, owner.username)
    const userResponse = await api.get('/api/users').expect(200)
    const listedOwner = userResponse.body.find(user => user.id === owner._id.toString())
    assert.equal(listedOwner.blogs.length, initialBlogs.length)
    assert.equal(Object.hasOwn(listedOwner, 'passwordHash'), false)
  })

  test('a blog can be created by a logged-in user and defaults likes to zero', async () => {
    const newBlog = { title: 'Reliable REST APIs', author: 'Sepehr', url: 'https://example.com/rest' }
    const response = await api.post('/api/blogs').set('Authorization', `Bearer ${ownerToken}`).send(newBlog).expect(201)
    assert.equal(response.body.likes, 0)
    assert.equal(response.body.user.toString(), owner._id.toString())
    const blogs = await Blog.find({})
    assert.equal(blogs.length, initialBlogs.length + 1)
    const updatedOwner = await User.findById(owner._id)
    assert.equal(updatedOwner.blogs.length, initialBlogs.length + 1)
  })

  test('blog creation requires a valid token', async () => {
    await api.post('/api/blogs').send({ title: 'No token', url: 'https://example.com' }).expect(401)
    await api.post('/api/blogs').set('Authorization', 'Bearer invalid').send({ title: 'Bad token', url: 'https://example.com' }).expect(401)
  })

  test('title and URL are required', async () => {
    await api.post('/api/blogs').set('Authorization', `Bearer ${ownerToken}`).send({ url: 'https://example.com' }).expect(400)
    await api.post('/api/blogs').set('Authorization', `Bearer ${ownerToken}`).send({ title: 'Missing URL' }).expect(400)
  })

  test('a blog can be updated', async () => {
    const blogs = await Blog.find({})
    const updated = await api.put(`/api/blogs/${blogs[0].id}`).send({ ...initialBlogs[0], likes: 30 }).expect(200)
    assert.equal(updated.body.likes, 30)
  })

  test('only the creator can delete a blog', async () => {
    const blog = await Blog.findOne({})
    await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${otherToken}`).expect(403)
    await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${ownerToken}`).expect(204)
    assert.equal(await Blog.countDocuments({ _id: blog._id }), 0)
    assert.equal((await User.findById(owner._id)).blogs.length, initialBlogs.length - 1)
  })

  test('malformatted identifiers return 400 and missing blogs return 404', async () => {
    await api.get('/api/blogs/not-an-id').expect(400)
    await api.delete('/api/blogs/not-an-id').set('Authorization', `Bearer ${ownerToken}`).expect(400)
    await api.get(`/api/blogs/${new mongoose.Types.ObjectId()}`).expect(404)
  })
})

describe('users and login API', () => {
  test('a user is created with a password hash, never a plaintext password', async () => {
    const response = await api.post('/api/users').send({ username: 'reader', name: 'Reader', password: 'read-safe' }).expect(201)
    assert.equal(response.body.username, 'reader')
    assert.equal(Object.hasOwn(response.body, 'passwordHash'), false)
    const stored = await User.findOne({ username: 'reader' })
    assert.notEqual(stored.passwordHash, 'read-safe')
    assert.equal(await bcrypt.compare('read-safe', stored.passwordHash), true)
  })

  test('invalid and duplicate usernames or passwords are rejected', async () => {
    await api.post('/api/users').send({ username: 'ab', password: 'long-enough' }).expect(400)
    await api.post('/api/users').send({ username: 'valid', password: 'ab' }).expect(400)
    await api.post('/api/users').send({ username: 'owner', password: 'another-password' }).expect(400)
    await api.post('/api/users').send({ password: 'long-enough' }).expect(400)
  })

  test('correct credentials return a token; invalid credentials return 401', async () => {
    const response = await api.post('/api/login').send({ username: 'owner', password: 'owner-password' }).expect(200)
    assert.ok(response.body.token)
    assert.equal(response.body.username, owner.username)
    await api.post('/api/login').send({ username: 'owner', password: 'wrong-password' }).expect(401)
  })
})

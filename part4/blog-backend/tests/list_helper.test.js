import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import listHelper from '../utils/list_helper.js'

const blogs = [
  { title: 'Patterns', author: 'Alex', likes: 7 },
  { title: 'Small Systems', author: 'Alex', likes: 4 },
  { title: 'Testing Clearly', author: 'Mina', likes: 12 },
]

describe('blog list helpers', () => {
  test('dummy returns one', () => assert.equal(listHelper.dummy([]), 1))
  test('totalLikes sums every blog', () => assert.equal(listHelper.totalLikes(blogs), 23))
  test('totalLikes returns zero for an empty list', () => assert.equal(listHelper.totalLikes([]), 0))
  test('favoriteBlog returns the blog with most likes', () => {
    assert.deepEqual(listHelper.favoriteBlog(blogs), blogs[2])
  })
  test('favoriteBlog returns null for an empty list', () => assert.equal(listHelper.favoriteBlog([]), null))
  test('mostBlogs returns the author with the most posts', () => {
    assert.deepEqual(listHelper.mostBlogs(blogs), { author: 'Alex', blogs: 2 })
  })
  test('mostLikes returns the author with the most total likes', () => {
    assert.deepEqual(listHelper.mostLikes(blogs), { author: 'Mina', likes: 12 })
  })
  test('author statistics return null for an empty list', () => {
    assert.equal(listHelper.mostBlogs([]), null)
    assert.equal(listHelper.mostLikes([]), null)
  })
})

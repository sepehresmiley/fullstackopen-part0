const dummy = (blogs) => {
  void blogs
  return 1
}

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  return blogs.reduce((best, blog) => (blog.likes || 0) > (best.likes || 0) ? blog : best)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const countByAuthor = blogs.reduce((counts, { author }) => {
    counts.set(author || '', (counts.get(author || '') || 0) + 1)
    return counts
  }, new Map())
  const [author, count] = [...countByAuthor].reduce((best, current) => current[1] > best[1] ? current : best)
  return { author, blogs: count }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const likesByAuthor = blogs.reduce((totals, { author, likes = 0 }) => {
    totals.set(author || '', (totals.get(author || '') || 0) + likes)
    return totals
  }, new Map())
  const [author, likes] = [...likesByAuthor].reduce((best, current) => current[1] > best[1] ? current : best)
  return { author, likes }
}

export default { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }

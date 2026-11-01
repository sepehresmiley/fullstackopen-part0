import React from 'react'
import { Link } from 'react-router-dom'

export default function BlogDetail({ blog, user, onLike, onRemove }) {
  const ownerId = blog.user?.id || blog.user
  const isOwner = Boolean(user && ownerId && ownerId === user.id)
  return <section className="page-content detail-page">
    <Link className="back-link" to="/">← All notes</Link>
    <p className="eyebrow">FIELDNOTE · {blog.author || 'UNKNOWN AUTHOR'}</p>
    <h1>{blog.title}</h1>
    <a className="blog-url" href={blog.url} target="_blank" rel="noreferrer">{blog.url} ↗</a>
    <div className="detail-stats"><span>♥ {blog.likes} {blog.likes === 1 ? 'like' : 'likes'}</span><span>Added by {blog.user?.name || blog.user?.username || 'a reader'}</span></div>
    {user && <button className="primary-button" onClick={() => onLike(blog)}>Like this note</button>}
    {isOwner && <button className="delete-link" onClick={() => onRemove(blog)}>Delete note</button>}
  </section>
}

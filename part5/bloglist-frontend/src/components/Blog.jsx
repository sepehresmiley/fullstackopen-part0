import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Blog({ blog, user, onLike, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const ownerId = blog.user?.id || blog.user
  const isOwner = Boolean(user && ownerId && ownerId === user.id)
  return (
    <article className="blog-card" data-testid="blog">
      <div className="blog-card-top">
        <div className="blog-meta"><span className="eyebrow">FIELDNOTE · {blog.author || 'UNKNOWN AUTHOR'}</span><h3><Link to={`/blogs/${blog.id}`}>{blog.title}</Link></h3></div>
        <button className="round-button" type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? `Hide details for ${blog.title}` : `View details for ${blog.title}`}>{expanded ? '−' : '+'}</button>
      </div>
      {expanded && <div className="blog-details">
        <a className="blog-url" href={blog.url} target="_blank" rel="noreferrer">{blog.url}<span aria-hidden="true"> ↗</span></a>
        <div className="blog-actions"><span className="likes"><span aria-hidden="true">♥</span> {blog.likes} {blog.likes === 1 ? 'like' : 'likes'}</span>{user && <button className="text-button" type="button" onClick={() => onLike(blog)}>Like</button>}</div>
        <p className="byline">Added by <strong>{blog.user?.name || blog.user?.username || 'a reader'}</strong></p>
        {isOwner && <button className="delete-link" type="button" onClick={() => onRemove(blog)}>Delete note</button>}
      </div>}
    </article>
  )
}

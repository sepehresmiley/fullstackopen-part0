import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import api from './services/api'
import Blog from './components/Blog'
import BlogDetail from './components/BlogDetail'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const savedUser = () => {
  try { return JSON.parse(window.localStorage.getItem('loggedBloglistUser')) }
  catch { return null }
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  return <form className="stack-form login-form" onSubmit={async (event) => { event.preventDefault(); await onLogin({ username, password }) }}>
    <label>Username<input aria-label="Username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
    <label>Password<input aria-label="Password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
    <button className="primary-button" type="submit">Sign in <span aria-hidden="true">↗</span></button>
  </form>
}

function BlogList({ blogs, user, onLike, onRemove }) {
  if (!blogs.length) return <div className="empty-state"><span className="empty-icon">✳</span><p>Your reading room is quiet.</p><small>Publish the first note to start the conversation.</small></div>
  return <div className="blog-list">{blogs.map(blog => <Blog key={blog.id} blog={blog} user={user} onLike={onLike} onRemove={onRemove} />)}</div>
}

export default function App() {
  const [user, setUser] = useState(savedUser)
  const [blogs, setBlogs] = useState([])
  const [users, setUsers] = useState([])
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const formRef = useRef()
  const noticeTimer = useRef()
  const navigate = useNavigate()

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000)
  }, [])

  const load = useCallback(async () => {
    try {
      const [blogRows, userRows] = await Promise.all([api.getBlogs(), api.getUsers()])
      setBlogs(blogRows.sort((a, b) => b.likes - a.likes))
      setUsers(userRows)
    } catch { notify('Could not reach the blog service. Try refreshing in a moment.', 'error') }
    finally { setLoading(false) }
  }, [notify])

  useEffect(() => { if (user?.token) api.setToken(user.token); load() }, [load, user?.token])
  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const login = async (credentials) => {
    try {
      const logged = await api.login(credentials)
      const account = { ...logged, name: logged.name || credentials.username }
      window.localStorage.setItem('loggedBloglistUser', JSON.stringify(account))
      api.setToken(account.token)
      setUser(account)
      notify(`Welcome back, ${account.name}.`)
      navigate('/')
    } catch { notify('Sign-in failed. Check your username and password.', 'error') }
  }

  const logout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    setUser(null); notify('You are signed out.')
    navigate('/')
  }

  const createBlog = async (blog) => {
    try {
      const created = await api.createBlog(blog)
      const withOwner = { ...created, user: created.user?.id ? created.user : { id: user.id, name: user.name, username: user.username } }
      setBlogs(current => [...current, withOwner].sort((a, b) => b.likes - a.likes))
      formRef.current?.hide(); notify(`“${blog.title}” is now in your reading room.`)
      navigate('/')
      return true
    } catch { notify('Could not publish this note. Please try again.', 'error'); return false }
  }

  const likeBlog = async (blog) => {
    try {
      const updated = await api.updateBlog({ ...blog, likes: blog.likes + 1 })
      setBlogs(current => current.map(item => item.id === blog.id ? { ...updated, user: item.user } : item).sort((a, b) => b.likes - a.likes))
      notify('Like added.')
    } catch { notify('Could not save your like. Please try again.', 'error') }
  }

  const removeBlog = async (blog) => {
    if (!window.confirm(`Remove “${blog.title}” from your reading room?`)) return
    try {
      await api.deleteBlog(blog.id)
      setBlogs(current => current.filter(item => item.id !== blog.id))
      notify('Note removed.')
      navigate('/')
    } catch { notify('Could not remove this note. Please try again.', 'error') }
  }

  const BlogView = () => {
    const { id } = useParams()
    const blog = blogs.find(item => item.id === id)
    if (!blog) return <section className="page-content"><p>{loading ? 'Loading note…' : 'This note could not be found.'}</p><Link to="/">← All notes</Link></section>
    return <BlogDetail blog={blog} user={user} onLike={likeBlog} onRemove={removeBlog} />
  }

  const UsersView = () => <section className="page-content"><p className="eyebrow">THE COMMUNITY</p><h1>Readers</h1><div className="user-list">{users.map(reader => <Link className="user-row" to={`/users/${reader.id}`} key={reader.id}><span className="user-avatar">{(reader.name || reader.username).slice(0, 1).toUpperCase()}</span><span><strong>{reader.name || reader.username}</strong><small>{reader.blogs.length} {reader.blogs.length === 1 ? 'note' : 'notes'}</small></span><span className="row-arrow">↗</span></Link>)}</div></section>

  const UserView = () => {
    const { id } = useParams()
    const reader = users.find(item => item.id === id)
    return <section className="page-content">{!reader ? <p>Reader not found.</p> : <><Link className="back-link" to="/users">← All readers</Link><p className="eyebrow">READER PROFILE</p><h1>{reader.name || reader.username}</h1><p className="muted">{reader.blogs.length} published {reader.blogs.length === 1 ? 'note' : 'notes'}</p><BlogList blogs={reader.blogs} user={user} onLike={likeBlog} onRemove={removeBlog} /></>}</section>
  }

  return <div className="app-shell">
    <header className="site-header"><Link className="brand" to="/"><span className="brand-symbol">f.</span><span>fieldnotes<small>IDEAS WORTH KEEPING</small></span></Link><nav aria-label="Main navigation"><NavLink to="/" end>Reading room</NavLink><NavLink to="/users">Readers</NavLink>{user && <NavLink to="/create">Write a note</NavLink>}</nav><div className="account-area">{user ? <><span className="signed-in"><i />{user.name || user.username}</span><button className="quiet-button" onClick={logout}>Sign out</button></> : <NavLink className="quiet-button" to="/login">Sign in</NavLink>}</div></header>
    <main><Notification notice={notice} /><Routes>
      <Route path="/" element={<><section className="hero"><div><p className="eyebrow">A PERSONAL READING ROOM</p><h1>Good ideas<br /><em>stay with us.</em></h1><p className="hero-intro">A quiet corner for thoughtful writing, useful discoveries, and things worth passing along.</p></div><div className="hero-art" aria-hidden="true"><span className="art-sun"/><span className="art-orbit orbit-a"/><span className="art-orbit orbit-b"/><span className="art-mark">f.</span><span className="art-caption">EST. FOR THE CURIOUS</span></div></section>
        <div className="home-grid"><section className="feed-section"><div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>Latest notes <span>{blogs.length.toString().padStart(2, '0')}</span></h2></div><span className="sort-label">MOST LOVED FIRST&nbsp; ↘</span></div>{loading ? <p className="muted">Gathering the notes…</p> : <BlogList blogs={blogs} user={user} onLike={likeBlog} onRemove={removeBlog} />}</section>
          <aside className="side-column">{user && <section className="aside-card create-card"><p className="eyebrow">ADD TO THE COLLECTION</p><h2>A good find?</h2><p className="muted">Share a link that stayed with you.</p><Togglable buttonLabel="Write a note" ref={formRef}><BlogForm onCreate={createBlog} onCancel={() => formRef.current?.hide()} /></Togglable></section>}<section className="aside-note"><span className="note-star">✳</span><p>“The more that you read, the more things you will know.”</p><small>DR. SEUSS</small></section></aside></div></>} />
      <Route path="/login" element={<section className="page-content"><p className="eyebrow">YOUR READING ROOM</p><h1>Welcome back.</h1><p className="muted">Sign in to share a note or save a little appreciation.</p><LoginForm onLogin={login} /></section>} />
      <Route path="/blogs/:id" element={<BlogView />} /><Route path="/users" element={<UsersView />} /><Route path="/users/:id" element={<UserView />} /><Route path="/create" element={<section className="page-content"><Link className="back-link" to="/">← Reading room</Link><p className="eyebrow">ADD TO THE COLLECTION</p><h1>Write a note.</h1>{user ? <BlogForm onCreate={createBlog} onCancel={() => navigate('/')} /> : <><p className="muted">Sign in to publish a note.</p><LoginForm onLogin={login} /></>}</section>} />
    </Routes></main><footer className="site-footer"><span>FIELDNOTES <b>·</b> FULL STACK OPEN / PART 5</span><span>MADE FOR THE THOUGHTFUL <i>✳</i></span></footer>
  </div>
}

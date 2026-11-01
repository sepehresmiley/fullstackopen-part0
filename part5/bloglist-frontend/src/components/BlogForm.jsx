import React, { useState } from 'react'

export default function BlogForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const created = await onCreate({ title: title.trim(), author: author.trim(), url: url.trim() })
    if (created) { setTitle(''); setAuthor(''); setUrl('') }
  }

  return <form className="stack-form" onSubmit={submit}>
    <label>Title<input aria-label="Title" value={title} onChange={event => setTitle(event.target.value)} required /></label>
    <label>Author<input aria-label="Author" value={author} onChange={event => setAuthor(event.target.value)} /></label>
    <label>URL<input aria-label="URL" type="url" value={url} onChange={event => setUrl(event.target.value)} required /></label>
    <div className="form-actions"><button className="primary-button" type="submit">Publish note <span aria-hidden="true">↗</span></button><button className="quiet-button" type="button" onClick={onCancel}>Cancel</button></div>
  </form>
}

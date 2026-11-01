import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Blog from './Blog'
import BlogForm from './BlogForm'
import BlogDetail from './BlogDetail'

afterEach(cleanup)

const blog = { id: 'abc', title: 'A useful idea', author: 'Mina Lee', url: 'https://example.com', likes: 4, user: { id: 'owner', name: 'Owner' } }

describe('Blog', () => {
  it('shows title and author while hiding URL and likes initially', () => {
    render(<MemoryRouter><Blog blog={blog} user={null} onLike={vi.fn()} onRemove={vi.fn()} /></MemoryRouter>)
    expect(screen.getByText('A useful idea')).toBeInTheDocument()
    expect(screen.getByText(/Mina Lee/)).toBeInTheDocument()
    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('4 likes')).not.toBeInTheDocument()
  })

  it('reveals the URL and likes when details are opened', () => {
    render(<MemoryRouter><Blog blog={blog} user={null} onLike={vi.fn()} onRemove={vi.fn()} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /view details/i }))
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('4 likes')).toBeInTheDocument()
  })

  it('calls the like handler for each click', () => {
    const onLike = vi.fn()
    render(<MemoryRouter><Blog blog={blog} user={{ id: 'reader' }} onLike={onLike} onRemove={vi.fn()} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /view details/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Like', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Like', exact: true }))
    expect(onLike).toHaveBeenCalledTimes(2)
  })
})

it('BlogForm calls its create handler with the entered details', async () => {
  const onCreate = vi.fn().mockResolvedValue(true)
  render(<BlogForm onCreate={onCreate} onCancel={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A useful idea' } })
  fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'Mina Lee' } })
  fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
  fireEvent.click(screen.getByRole('button', { name: /publish note/i }))
  expect(onCreate).toHaveBeenCalledWith({ title: 'A useful idea', author: 'Mina Lee', url: 'https://example.com' })
})

describe('BlogDetail access controls', () => {
  const detail = (user) => render(<MemoryRouter><BlogDetail blog={blog} user={user} onLike={vi.fn()} onRemove={vi.fn()} /></MemoryRouter>)

  it('shows blog information to unauthenticated readers without action buttons', () => {
    detail(null)
    expect(screen.getByRole('heading', { name: 'A useful idea' })).toBeInTheDocument()
    expect(document.querySelector('.detail-stats').textContent).toContain('4 likes')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows only Like to an authenticated non-owner', () => {
    detail({ id: 'reader' })
    expect(screen.getByRole('button', { name: 'Like this note' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete note' })).not.toBeInTheDocument()
  })

  it('shows the delete action to the creator', () => {
    detail({ id: 'owner' })
    expect(screen.getByRole('button', { name: 'Like this note' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete note' })).toBeInTheDocument()
  })
})

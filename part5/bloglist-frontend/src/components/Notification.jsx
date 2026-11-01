import React from 'react'

export default function Notification({ notice }) {
  if (!notice) return null
  return <div className={`notice ${notice.type}`} role="status" aria-live="polite">{notice.message}</div>
}

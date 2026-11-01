export default function Notification({ notice }) {
  if (!notice) return null
  return <div className={`notification ${notice.type}`} role="status" aria-live="polite">{notice.message}</div>
}

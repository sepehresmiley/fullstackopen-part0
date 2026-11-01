import React, { forwardRef, useImperativeHandle, useState } from 'react'

const Togglable = forwardRef(function Togglable({ buttonLabel, children }, ref) {
  const [visible, setVisible] = useState(false)
  useImperativeHandle(ref, () => ({ show: () => setVisible(true), hide: () => setVisible(false) }), [])
  return <div className="togglable">{visible ? children : <button className="primary-button" onClick={() => setVisible(true)}>{buttonLabel} <span aria-hidden="true">＋</span></button>}</div>
})

export default Togglable

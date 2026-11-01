import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import App from './App.jsx'
import './style.css'

const PremiumPolish = createGlobalStyle`
  .site-header { box-shadow: 0 1px 0 rgba(255,255,255,.65); }
  .site-header nav a, .quiet-button { transition: color .18s ease, background .18s ease; }
  .site-header nav a.active { position: relative; }
  .site-header nav a.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -37px; height: 2px; background: #c8a766; }
  .stack-form input { border-radius: 3px; transition: border-color .18s ease, box-shadow .18s ease; }
  .stack-form input:focus { box-shadow: 0 0 0 3px rgba(200,167,102,.15); }
  .primary-button { border-radius: 2px; box-shadow: 0 3px 8px rgba(23,48,71,.12); }
  .notice { border-radius: 3px; animation: note-arrive .24s ease-out both; }
  .blog-card { border-radius: 3px; box-shadow: 0 3px 12px rgba(40,49,48,.025); }
  .detail-page { background: #fbfaf6; border: 1px solid #e8e2d5; padding: clamp(24px,5vw,52px); box-shadow: 0 16px 48px rgba(31,48,54,.05); }
  @keyframes note-arrive { from { opacity: 0; transform: translate(-50%,-8px); } to { opacity: 1; transform: translate(-50%,0); } }
  @media(max-width:650px) { .site-header nav a.active::after { bottom: -8px; } }
`

createRoot(document.getElementById('root')).render(<BrowserRouter><PremiumPolish /><App /></BrowserRouter>)

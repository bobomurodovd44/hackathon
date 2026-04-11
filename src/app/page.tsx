'use client'

import { useState } from 'react'
import UploadForm from '@/components/UploadForm'

export default function Home() {
  const [token, setToken] = useState('')

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Simple Upload Test</h1>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>JWT Token:</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here"
          style={{ width: '100%', maxWidth: '600px', padding: '8px' }}
        />
      </div>
      <UploadForm token={token} />
    </div>
  )
}

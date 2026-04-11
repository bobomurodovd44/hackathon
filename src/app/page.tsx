'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('')

  const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !token) {
      setStatus('Please select a file and provide a token')
      return
    }

    setStatus('Starting upload...')

    try {
      if (file.size <= CHUNK_SIZE) {
        // Single shot upload for small files
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('http://localhost:3030/uploads', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error: ${response.statusText}`)
        }

        const result = await response.json()
        setStatus(`Success! File URL: ${result.url}`)
      } else {
        // Multipart upload for large files
        // 1. Initiate
        setStatus('Initiating multipart upload...')
        const initRes = await fetch('http://localhost:3030/uploads', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'initiate', filename: file.name })
        })

        if (!initRes.ok) {
          const errorData = await initRes.json().catch(() => ({}))
          throw new Error(`Initiation failed: ${errorData.message || initRes.statusText}`)
        }

        const { uploadId, key } = await initRes.json()
        const totalParts = Math.ceil(file.size / CHUNK_SIZE)
        const parts = []

        // 2. Upload Parts
        for (let i = 0; i < totalParts; i++) {
          const start = i * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.size)
          const chunk = file.slice(start, end)
          const partNumber = i + 1

          setStatus(`Uploading part ${partNumber} of ${totalParts}... (${Math.round((i / totalParts) * 100)}%)`)

          const formData = new FormData()
          formData.append('file', chunk)
          formData.append('uploadId', uploadId)
          formData.append('partNumber', partNumber.toString())
          formData.append('key', key)

          const partRes = await fetch('http://localhost:3030/uploads', {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          })

          if (!partRes.ok) {
            const errorData = await partRes.json().catch(() => ({}))
            throw new Error(`Part ${partNumber} upload failed: ${errorData.message || partRes.statusText}`)
          }

          const { ETag } = await partRes.json()
          parts.push({ ETag, PartNumber: partNumber })
        }

        // 3. Complete
        setStatus('Completing multipart upload...')
        const completeRes = await fetch('http://localhost:3030/uploads', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'complete', uploadId, key, parts })
        })

        if (!completeRes.ok) {
          const errorData = await completeRes.json().catch(() => ({}))
          throw new Error(`Completion failed: ${errorData.message || completeRes.statusText}`)
        }

        const finalResult = await completeRes.json()
        setStatus(`Success! Large file uploaded: ${finalResult.url}`)
      }
    } catch (error: any) {
      setStatus(`Failed: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Simple Upload Test</h1>
      <form onSubmit={handleUpload}>
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
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>File:</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            style={{ padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Upload to S3
        </button>
      </form>
      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: status.startsWith('Success') ? '#e6fffa' : '#fff5f5',
          border: `1px solid ${status.startsWith('Success') ? '#38b2ac' : '#feb2b2'}`,
          borderRadius: '4px'
        }}>
          <strong>Status:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{status}</pre>
        </div>
      )}
    </div>
  )
}

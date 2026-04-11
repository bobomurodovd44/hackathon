'use client'

import { useState } from 'react'
import { uploadFile } from '@/lib/upload'

interface UploadFormProps {
  token: string
}

const STATUS_TYPE = {
  success: 'success',
  error: 'error',
  info: 'info'
} as const

function getStatusType(status: string): keyof typeof STATUS_TYPE {
  if (status.startsWith('Success')) return 'success'
  if (status.startsWith('Failed')) return 'error'
  return 'info'
}

const statusStyles: Record<keyof typeof STATUS_TYPE, React.CSSProperties> = {
  success: { backgroundColor: '#e6fffa', border: '1px solid #38b2ac' },
  error: { backgroundColor: '#fff5f5', border: '1px solid #feb2b2' },
  info: { backgroundColor: '#ebf8ff', border: '1px solid #90cdf4' }
}

export default function UploadForm({ token }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setStatus('Please select a file')
      return
    }
    if (!token) {
      setStatus('No token provided')
      return
    }

    setIsUploading(true)
    setStatus('Starting upload...')

    try {
      const url = await uploadFile(file, token, setStatus)
      setStatus(`Success! File URL: ${url}`)
    } catch (error: any) {
      setStatus(`Failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const statusType = getStatusType(status)

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>File:</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
          style={{ padding: '8px' }}
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        style={{ padding: '10px 20px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
      >
        {isUploading ? 'Uploading...' : 'Upload to S3'}
      </button>

      {status && (
        <div style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', ...statusStyles[statusType] }}>
          <strong>Status:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>{status}</pre>
        </div>
      )}
    </form>
  )
}

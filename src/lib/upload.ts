const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const BASE_URL = `http://${host}:3030`
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export type UploadProgressCallback = (message: string) => void

export type UploadResult = {
  _id: string
  url: string
}

const toUploadResult = (payload: unknown): UploadResult => {
  const data = payload as { _id?: string; id?: string; url?: string }
  return {
    _id: data._id || data.id || '',
    url: data.url || ''
  }
}

export async function singleUpload(file: File, token: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const message = (error as { message?: string }).message || `Error: ${response.statusText}`
    throw new Error(message)
  }

  const result = await response.json()
  return toUploadResult(result)
}

async function initiateMultipart(filename: string, token: string): Promise<{ uploadId: string; key: string }> {
  const res = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'initiate', filename })
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    const message = (error as { message?: string }).message || res.statusText
    throw new Error(`Initiation failed: ${message}`)
  }

  return res.json()
}

async function uploadPart(
  chunk: Blob,
  uploadId: string,
  key: string,
  partNumber: number,
  token: string
): Promise<{ ETag: string; PartNumber: number }> {
  const formData = new FormData()
  formData.append('file', chunk)
  formData.append('uploadId', uploadId)
  formData.append('partNumber', partNumber.toString())
  formData.append('key', key)

  const res = await fetch(`${BASE_URL}/uploads`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    const message = (error as { message?: string }).message || res.statusText
    throw new Error(`Part ${partNumber} failed: ${message}`)
  }

  const body = await res.json() as { ETag: string }
  return { ETag: body.ETag, PartNumber: partNumber }
}

async function completeMultipart(
  uploadId: string,
  key: string,
  parts: { ETag: string; PartNumber: number }[],
  mimeType: string,
  token: string
): Promise<UploadResult> {
  const res = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'complete', uploadId, key, parts, mimeType })
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    const message = (error as { message?: string }).message || res.statusText
    throw new Error(`Completion failed: ${message}`)
  }

  const result = await res.json()
  return toUploadResult(result)
}

const toMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1)

export async function multipartUpload(
  file: File,
  token: string,
  onProgress: UploadProgressCallback
): Promise<UploadResult> {
  onProgress('Initiating multipart upload...')
  const { uploadId, key } = await initiateMultipart(file.name, token)

  const totalParts = Math.ceil(file.size / CHUNK_SIZE)
  const parts: { ETag: string; PartNumber: number }[] = []

  for (let i = 0; i < totalParts; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    const partNumber = i + 1

    const uploadedMB = toMB(start)
    const totalMB = toMB(file.size)
    onProgress(`Uploading... ${uploadedMB} MB / ${totalMB} MB`)

    const part = await uploadPart(chunk, uploadId, key, partNumber, token)
    parts.push(part)
  }

  onProgress('Completing multipart upload...')
  return completeMultipart(uploadId, key, parts, file.type, token)
}

export async function uploadFile(
  file: File,
  token: string,
  onProgress: UploadProgressCallback
): Promise<UploadResult> {
  if (file.size <= CHUNK_SIZE) {
    onProgress('Uploading...')
    return singleUpload(file, token)
  }
  return multipartUpload(file, token, onProgress)
}

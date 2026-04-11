const BASE_URL = 'http://localhost:3030'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export type UploadProgressCallback = (message: string) => void

export async function singleUpload(
  file: File,
  token: string
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Error: ${response.statusText}`)
  }

  const result = await response.json()
  return result.url
}

async function initiateMultipart(
  filename: string,
  token: string
): Promise<{ uploadId: string; key: string }> {
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
    throw new Error(`Initiation failed: ${error.message || res.statusText}`)
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
    throw new Error(`Part ${partNumber} failed: ${error.message || res.statusText}`)
  }

  const { ETag } = await res.json()
  return { ETag, PartNumber: partNumber }
}

async function completeMultipart(
  uploadId: string,
  key: string,
  parts: { ETag: string; PartNumber: number }[],
  mimeType: string,
  token: string
): Promise<string> {
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
    throw new Error(`Completion failed: ${error.message || res.statusText}`)
  }

  const result = await res.json()
  return result.url
}

const toMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1)

export async function multipartUpload(
  file: File,
  token: string,
  onProgress: UploadProgressCallback
): Promise<string> {
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
): Promise<string> {
  if (file.size <= CHUNK_SIZE) {
    onProgress('Uploading...')
    return singleUpload(file, token)
  }
  return multipartUpload(file, token, onProgress)
}

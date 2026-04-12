import { cookies } from 'next/headers'

const BASE_URL = 'http://localhost:3030'

export async function serverFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('feathers-jwt')?.value

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  headers.set('Content-Type', 'application/json')

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    // Add next.js caching options if needed
    next: { revalidate: 0 } // No cache for now to ensure freshness
  })

  if (!response.ok) {
    if (response.status === 401) {
      return null
    }
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.message || `Server fetch failed: ${response.statusText}`)
  }

  return response.json()
}

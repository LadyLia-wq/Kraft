const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('kraft_token')

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }
  return data
}
export const BASE_URL = 'http://localhost:3000'

function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function apiFetch(endpoint: string, options : { method: string, body?: string } = {method: "GET"}) {
  try{
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(BASE_URL + endpoint, {
      headers,
      ...options.body && {body: options.body},
      method: options.method
    })
    if (response.status === 401) {
      clearAuth()
      window.location.href = '/login'
      return { error: 'Session expirée' }
    }
    return response.json()
  }
  catch (err) {
    console.error("Error in apiFetch: ", err)
    return { error: "An error occurred while making the API request.", errorDetails: err }
  }
}

export function getProfile() {
  return apiFetch("/profile", { method: "GET" })
}

export function updateProfile(nom: string, prenom: string) {
  return apiFetch("/profile", { method: "PUT", body: JSON.stringify({ nom, prenom }) })
}

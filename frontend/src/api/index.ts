const BASE_URL = 'http://localhost:3000'

export async function apiFetch(endpoint: string, options : { method: string, body?: string } = {method: "GET"}) {
  try{
    const token = localStorage.getItem('token')  
    if(!token){
      console.warn("No token found in localStorage. API requests may fail if authentication is required.")
    }
    const response = await fetch(BASE_URL + endpoint, {
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    ...options.body && {body: options.body},
    method: options.method
  })
  return response.json()}
  catch (err) {
    console.error("Error in apiFetch: ", err)
    return { error: "An error occurred while making the API request.", errorDetails: err }
  }
}

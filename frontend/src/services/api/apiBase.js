// Base API configuration and helpers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Get auth token from storage
const getAuthToken = () => localStorage.getItem('hpl_admin_token')

// Base fetch wrapper with error handling
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // If body is FormData, let browser set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  // Add auth token if available
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`)
    }

    return { success: true, data: data.data, message: data.message }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message)
    return { success: false, error: error.message }
  }
}

// Helper methods
export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  
  post: (endpoint, body) => apiFetch(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  put: (endpoint, body) => apiFetch(endpoint, { 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
}

export default api

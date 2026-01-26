// Auth API Service
import { apiFetch } from './apiBase'

export const authApi = {
  // Admin login
  login: async (email, password) => {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return result
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('hpl_admin_token')
  },

  // Store token
  setToken: (token) => {
    localStorage.setItem('hpl_admin_token', token)
  },

  // Get stored admin info
  getAdmin: () => {
    const admin = localStorage.getItem('hpl_admin')
    return admin ? JSON.parse(admin) : null
  },

  // Store admin info
  setAdmin: (admin) => {
    localStorage.setItem('hpl_admin', JSON.stringify(admin))
  },

  // Clear auth data (logout)
  logout: () => {
    localStorage.removeItem('hpl_admin_token')
    localStorage.removeItem('hpl_admin')
  },

  // Alias for logout
  clearAuth: () => {
    localStorage.removeItem('hpl_admin_token')
    localStorage.removeItem('hpl_admin')
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('hpl_admin_token')
  },
}

export default authApi

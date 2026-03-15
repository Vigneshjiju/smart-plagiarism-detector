import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
    if (import.meta.env.DEV) {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`)
    }
    return response
  },
  (error) => {
    const { response, request, message } = error

    if (response) {
      const status = response.status
      const msg = response.data?.message || response.data?.error || 'An error occurred'

      if (status === 401) {
        localStorage.removeItem('auth_token')
        toast.error('Session expired. Please login again.')
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.')
      } else if (status === 404) {
        toast.error('Resource not found.')
      } else if (status === 429) {
        toast.error('Too many requests. Please slow down.')
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error(msg)
      }
    } else if (request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error(message || 'An unexpected error occurred.')
    }

    return Promise.reject(error)
  },
)

export default api

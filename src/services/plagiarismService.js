import api from './api'
import { analyzePlagiarism } from '../utils/textAnalysis'

// Simulated delay for realistic UX (replaces real API call)
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export const plagiarismService = {
  /**
   * Check text for plagiarism using local analysis engine
   * Falls back to local analysis if API is unavailable
   */
  async checkText(text, options = {}) {
    await delay(1500 + Math.random() * 1000)

    // Local advanced analysis
    const results = analyzePlagiarism(text, options)
    return results
  },

  /**
   * Submit check to remote API (if configured)
   */
  async submitToAPI(text) {
    try {
      const response = await api.post('/plagiarism/check', { text })
      return response.data
    } catch {
      // If API fails, fall back to local analysis
      return analyzePlagiarism(text)
    }
  },

  /**
   * Get check history from API
   */
  async getHistory(page = 1, limit = 10) {
    try {
      const response = await api.get(`/plagiarism/history?page=${page}&limit=${limit}`)
      return response.data
    } catch {
      return null
    }
  },

  /**
   * Get specific check result
   */
  async getResult(checkId) {
    try {
      const response = await api.get(`/plagiarism/results/${checkId}`)
      return response.data
    } catch {
      return null
    }
  },

  /**
   * Export result as PDF/JSON
   */
  async exportResult(checkId, format = 'json') {
    try {
      const response = await api.get(`/plagiarism/export/${checkId}?format=${format}`, {
        responseType: 'blob',
      })
      return response.data
    } catch {
      return null
    }
  },
}

export default plagiarismService

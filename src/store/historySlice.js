import { createSlice } from '@reduxjs/toolkit'

const loadHistory = () => {
  try {
    const stored = localStorage.getItem('plagiarism_history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveHistory = (items) => {
  try {
    localStorage.setItem('plagiarism_history', JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

const initialState = {
  items: loadHistory(),
  filter: 'all', // 'all' | 'high' | 'medium' | 'low'
  searchQuery: '',
  sortBy: 'date', // 'date' | 'score' | 'words'
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryItem(state, action) {
      const newItem = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }
      state.items.unshift(newItem)
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50)
      }
      saveHistory(state.items)
    },
    removeHistoryItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
      saveHistory(state.items)
    },
    clearHistory(state) {
      state.items = []
      saveHistory([])
    },
    setFilter(state, action) {
      state.filter = action.payload
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    setSortBy(state, action) {
      state.sortBy = action.payload
    },
  },
})

export const {
  addHistoryItem,
  removeHistoryItem,
  clearHistory,
  setFilter,
  setSearchQuery,
  setSortBy,
} = historySlice.actions

export default historySlice.reducer

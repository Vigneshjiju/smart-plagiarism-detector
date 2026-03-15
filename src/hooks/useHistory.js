import { useSelector, useDispatch } from 'react-redux'
import {
  removeHistoryItem,
  clearHistory,
  setFilter,
  setSearchQuery,
  setSortBy,
} from '../store/historySlice'

export const useHistory = () => {
  const dispatch = useDispatch()
  const { items, filter, searchQuery, sortBy } = useSelector((state) => state.history)

  const filteredItems = items
    .filter((item) => {
      if (filter === 'all') return true
      if (filter === 'high') return item.overallScore >= 70
      if (filter === 'medium') return item.overallScore >= 30 && item.overallScore < 70
      if (filter === 'low') return item.overallScore < 30
      return true
    })
    .filter((item) =>
      searchQuery
        ? item.text.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore
      if (sortBy === 'words') return b.wordCount - a.wordCount
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

  const stats = {
    total: items.length,
    high: items.filter((i) => i.overallScore >= 70).length,
    medium: items.filter((i) => i.overallScore >= 30 && i.overallScore < 70).length,
    low: items.filter((i) => i.overallScore < 30).length,
    avgScore:
      items.length > 0
        ? Math.round(items.reduce((a, b) => a + b.overallScore, 0) / items.length)
        : 0,
    totalWords: items.reduce((a, b) => a + (b.wordCount || 0), 0),
  }

  return {
    items: filteredItems,
    allItems: items,
    filter,
    searchQuery,
    sortBy,
    stats,
    setFilter: (f) => dispatch(setFilter(f)),
    setSearchQuery: (q) => dispatch(setSearchQuery(q)),
    setSortBy: (s) => dispatch(setSortBy(s)),
    removeItem: (id) => dispatch(removeHistoryItem(id)),
    clearAll: () => dispatch(clearHistory()),
  }
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, SortAsc, Trash2, FileSearch, AlertTriangle } from 'lucide-react'
import { useHistory } from '../hooks/useHistory'
import ResultCard from '../components/ResultCard'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High (≥70%)' },
  { value: 'medium', label: 'Medium (30-70%)' },
  { value: 'low', label: 'Low (<30%)' },
]

const SORTS = [
  { value: 'date', label: 'Newest First' },
  { value: 'score', label: 'Highest Score' },
  { value: 'words', label: 'Most Words' },
]

export default function History() {
  const {
    items,
    allItems,
    filter,
    searchQuery,
    sortBy,
    setFilter,
    setSearchQuery,
    setSortBy,
    removeItem,
    clearAll,
  } = useHistory()

  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearAll = () => {
    if (confirmClear) {
      clearAll()
      setConfirmClear(false)
      toast.success('History cleared.')
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  const handleDelete = (id) => {
    removeItem(id)
    toast.success('Entry removed.')
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {allItems.length} total check{allItems.length !== 1 ? 's' : ''} saved locally
          </p>
        </div>
        {allItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
              confirmClear
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20',
            )}
          >
            <Trash2 size={14} />
            {confirmClear ? 'Confirm Clear All' : 'Clear All'}
          </button>
        )}
      </div>

      {allItems.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileSearch size={28} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No History Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Your plagiarism checks will appear here after you run your first check.
          </p>
          <Link to="/checker" className="btn-primary">
            <FileSearch size={16} />
            Run First Check
          </Link>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by text content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9"
                />
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <div className="relative">
                  <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field pl-8 pr-3 appearance-none cursor-pointer w-auto"
                  >
                    {FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <SortAsc size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field pl-8 pr-3 appearance-none cursor-pointer w-auto"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing {items.length} of {allItems.length} checks
          </p>

          {/* Items list */}
          {items.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results match your filters.</p>
              <button
                onClick={() => { setFilter('all'); setSearchQuery('') }}
                className="mt-4 text-sm text-primary-600 hover:underline dark:text-primary-400"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ResultCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

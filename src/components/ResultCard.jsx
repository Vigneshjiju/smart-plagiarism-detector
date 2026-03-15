import { Clock, FileText, ExternalLink, Trash2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setResults } from '../store/plagiarismSlice'
import clsx from 'clsx'
import { formatRelativeTime, getScoreColor, getScoreLabel, formatWordCount } from '../utils/formatters'
import SimilarityMeter from './SimilarityMeter'

export default function ResultCard({ item, onDelete }) {
  const dispatch = useDispatch()
  const colors = getScoreColor(item.overallScore)

  const handleViewResults = () => {
    if (item.results) {
      dispatch(setResults(item.results))
    }
  }

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200 animate-slide-up group">
      <div className="flex items-start gap-4">
        {/* Score meter */}
        <div className="flex-shrink-0">
          <SimilarityMeter score={item.overallScore} size="sm" showLabel={false} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {item.text}
              </p>
            </div>
            <span className={clsx('badge flex-shrink-0', colors.badge)}>
              {getScoreLabel(item.overallScore)}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock size={11} />
              <span>{formatRelativeTime(item.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <FileText size={11} />
              <span>{formatWordCount(item.wordCount)} words</span>
            </div>
            {item.sourceCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <ExternalLink size={11} />
                <span>{item.sourceCount} source{item.sourceCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.results && (
            <Link
              to="/results"
              onClick={handleViewResults}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="View results"
            >
              <ChevronRight size={16} />
            </Link>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

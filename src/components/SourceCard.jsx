import { ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { getCategoryIcon, truncateText } from '../utils/formatters'

export default function SourceCard({ source, rank }) {
  const getBarColor = (similarity) => {
    if (similarity >= 70) return 'bg-red-500'
    if (similarity >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-base">
            {getCategoryIcon(source.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                #{rank}
              </span>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {source.title}
              </h4>
              <span className="badge badge-blue capitalize">{source.category}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {truncateText(source.snippet, 120)}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span
            className={clsx(
              'text-lg font-bold',
              source.similarity >= 70
                ? 'text-red-600 dark:text-red-400'
                : source.similarity >= 40
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400',
            )}
          >
            {source.similarity}%
          </span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Similarity bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={clsx('h-1.5 rounded-full transition-all duration-500', getBarColor(source.similarity))}
            style={{ width: `${source.similarity}%` }}
          />
        </div>
      </div>
    </div>
  )
}

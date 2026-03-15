import Skeleton from './Skeleton'

/**
 * Single history item skeleton – mirrors the layout of ResultCard.jsx.
 * Used to show 3-5 placeholder rows while history is loading.
 */
export default function SkeletonHistoryItem() {
  return (
    <div className="card p-4" aria-hidden="true">
      <div className="flex items-start gap-4">
        {/* Circular similarity meter placeholder */}
        <Skeleton circle className="w-12 h-12 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Text preview – two lines */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            {/* Badge placeholder */}
            <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
          </div>

          {/* Metadata row: timestamp / word count / sources */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Action icon placeholder */}
        <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
      </div>
    </div>
  )
}

/**
 * Convenience wrapper that renders N skeleton rows with a staggered appearance.
 */
export function SkeletonHistoryList({ count = 5 }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ opacity: 1 - i * 0.15 }}
        >
          <SkeletonHistoryItem />
        </div>
      ))}
    </div>
  )
}

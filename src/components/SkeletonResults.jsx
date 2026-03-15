import Skeleton, { SkeletonText } from './Skeleton'

/**
 * Full-page skeleton for the Results view.
 * Matches the layout of Results.jsx: header → score card → tabs → content.
 */
export default function SkeletonResults() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse" aria-hidden="true">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* ── Score summary card ──────────────────────────────────────── */}
      <div className="card p-6 mb-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Circular meter placeholder */}
          <Skeleton circle className="w-36 h-36 flex-shrink-0" />

          {/* Stat grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Summary banner */}
        <div className="mt-5 p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-start gap-3">
          <Skeleton circle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-32" />
            <SkeletonText lines={2} lastLineWidth="w-4/5" />
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        {[80, 100, 120].map((w) => (
          <Skeleton key={w} className={`h-9 w-${w / 4} rounded-t-md`} style={{ width: w }} />
        ))}
      </div>

      {/* ── Content card ────────────────────────────────────────────── */}
      <div className="card p-6">
        <Skeleton className="h-5 w-40 mb-5" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import clsx from 'clsx'

/**
 * Base skeleton shimmer block.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32 rounded" />
 *   <Skeleton className="h-4 w-full rounded" />
 *   <Skeleton circle className="w-12 h-12" />
 */
export default function Skeleton({ className = '', circle = false, children }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        circle ? 'rounded-full' : 'rounded',
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

/** Pre-composed multi-line text skeleton */
export function SkeletonText({ lines = 3, lastLineWidth = 'w-3/4' }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-3', i === lines - 1 ? lastLineWidth : 'w-full')}
        />
      ))}
    </div>
  )
}

/** Full-width horizontal rule shimmer */
export function SkeletonDivider() {
  return <Skeleton className="h-px w-full my-1" />
}

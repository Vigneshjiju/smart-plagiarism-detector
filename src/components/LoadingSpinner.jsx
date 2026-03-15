import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Analyzing your text...', size = 'md' }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      {/* Animated rings */}
      <div className="relative">
        <div className={`${sizeMap[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`} />
        <div
          className={`${sizeMap[size]} rounded-full border-4 border-transparent border-t-primary-600 animate-spin absolute inset-0`}
        />
      </div>

      <div className="text-center">
        <p className="font-medium text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-center gap-1 mt-3">
          {['Scanning text patterns...', 'Matching sources...', 'Computing similarity...'].map(
            (step, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />}
                <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}>
                  {step}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

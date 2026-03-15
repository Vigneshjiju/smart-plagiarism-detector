import { useMemo } from 'react'
import clsx from 'clsx'

export default function HighlightedText({ text, segments }) {
  const parts = useMemo(() => {
    if (!segments || segments.length === 0) return [{ text, highlighted: false }]

    const sorted = [...segments].sort((a, b) => a.start - b.start)
    const result = []
    let cursor = 0

    for (const seg of sorted) {
      if (seg.start > cursor) {
        result.push({ text: text.slice(cursor, seg.start), highlighted: false })
      }
      if (seg.end > cursor) {
        const start = Math.max(seg.start, cursor)
        result.push({
          text: text.slice(start, seg.end),
          highlighted: true,
          similarity: seg.similarity,
          source: seg.source,
        })
        cursor = seg.end
      }
    }

    if (cursor < text.length) {
      result.push({ text: text.slice(cursor), highlighted: false })
    }

    return result
  }, [text, segments])

  const getHighlightColor = (similarity) => {
    if (similarity >= 0.7) return 'bg-red-200 dark:bg-red-900/50 border-b-2 border-red-400 dark:border-red-500'
    if (similarity >= 0.4) return 'bg-yellow-200 dark:bg-yellow-900/50 border-b-2 border-yellow-400 dark:border-yellow-500'
    return 'bg-orange-100 dark:bg-orange-900/30 border-b-2 border-orange-300 dark:border-orange-500'
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div className="font-sans text-sm leading-7 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
        {parts.map((part, i) =>
          part.highlighted ? (
            <span
              key={i}
              title={part.source ? `Similar to: ${part.source.title}` : 'Possible match'}
              className={clsx(
                'cursor-help rounded-sm px-0.5 transition-colors',
                getHighlightColor(part.similarity),
              )}
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </div>

      {segments && segments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded bg-red-200 dark:bg-red-900/50 border-b-2 border-red-400" />
            <span className="text-gray-500 dark:text-gray-400">High similarity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded bg-yellow-200 dark:bg-yellow-900/50 border-b-2 border-yellow-400" />
            <span className="text-gray-500 dark:text-gray-400">Moderate similarity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded bg-orange-100 dark:bg-orange-900/30 border-b-2 border-orange-300" />
            <span className="text-gray-500 dark:text-gray-400">Low similarity</span>
          </div>
        </div>
      )}
    </div>
  )
}

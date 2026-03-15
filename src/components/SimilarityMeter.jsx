import { useMemo } from 'react'
import clsx from 'clsx'
import { getScoreColor, getScoreLabel } from '../utils/formatters'

/**
 * SimilarityMeter
 *
 * Props:
 *   score       – 0-100  plagiarism percentage
 *   confidence  – 0-100  optional confidence level (shows indicator when provided)
 *   size        – 'sm' | 'md' | 'lg'
 *   showLabel   – boolean
 */
export default function SimilarityMeter({ score, confidence, size = 'md', showLabel = true }) {
  const colors = useMemo(() => getScoreColor(score), [score])
  const label = getScoreLabel(score)

  const radius = size === 'lg' ? 70 : size === 'sm' ? 40 : 55
  const stroke = size === 'lg' ? 10 : size === 'sm' ? 6 : 8
  // Confidence ring is slightly larger than the bg ring
  const confRadius = radius + stroke + 5
  const viewBox = confRadius * 2 + stroke * 2 + 4
  const center = viewBox / 2
  const circumference = 2 * Math.PI * radius
  const confCircumference = 2 * Math.PI * confRadius

  const filled = (score / 100) * circumference
  const empty = circumference - filled

  const confFilled = confidence != null ? (confidence / 100) * confCircumference : 0
  const confEmpty = confCircumference - confFilled

  const fontSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const labelSize = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={viewBox}
          height={viewBox}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="-rotate-90"
        >
          {/* Optional outer confidence ring – bg track */}
          {confidence != null && (
            <circle
              cx={center}
              cy={center}
              r={confRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              className="text-gray-200 dark:text-gray-700"
            />
          )}
          {/* Confidence arc */}
          {confidence != null && (
            <circle
              cx={center}
              cy={center}
              r={confRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeDasharray={`${confFilled} ${confEmpty}`}
              strokeLinecap="round"
              className="text-gray-400 dark:text-gray-500 transition-all duration-700 ease-out"
            />
          )}

          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.hex}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${empty}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <span className={clsx('font-bold leading-none', fontSize, colors.text)}>
            {score}%
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">similarity</span>
          )}
        </div>
      </div>

      {/* Label pill */}
      {showLabel && (
        <span
          className={clsx(
            'font-medium px-3 py-1 rounded-full',
            labelSize,
            colors.text,
            colors.bg,
          )}
        >
          {label}
        </span>
      )}

      {/* Confidence indicator below label */}
      {confidence != null && size !== 'sm' && (
        <ConfidenceBar confidence={confidence} />
      )}
    </div>
  )
}

function ConfidenceBar({ confidence }) {
  const level =
    confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'
  const color =
    confidence >= 80
      ? 'bg-green-500'
      : confidence >= 50
      ? 'bg-yellow-400'
      : 'bg-red-400'
  const textColor =
    confidence >= 80
      ? 'text-green-600 dark:text-green-400'
      : confidence >= 50
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-[120px]">
      <div className="flex items-center justify-between w-full text-xs">
        <span className="text-gray-400 dark:text-gray-500">Confidence</span>
        <span className={clsx('font-medium', textColor)}>
          {level} ({confidence}%)
        </span>
      </div>
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Info, Zap, Layers, GitMerge, Fingerprint, Brain, Settings2 } from 'lucide-react'
import clsx from 'clsx'

const ALGORITHMS = [
  {
    id: 'auto',
    label: 'Auto',
    shortLabel: 'Auto (Smart)',
    icon: Zap,
    description: 'Automatically selects the best algorithm based on your text length and content type.',
    badge: 'Recommended',
    badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  },
  {
    id: 'cosine',
    label: 'Cosine Similarity',
    shortLabel: 'Cosine',
    icon: Layers,
    description: 'Converts text into TF-IDF vectors and measures the cosine angle between them. Best for documents of similar length.',
  },
  {
    id: 'jaccard',
    label: 'Jaccard Index',
    shortLabel: 'Jaccard',
    icon: GitMerge,
    description: 'Measures set-based word overlap. Fast and effective for detecting exact or near-exact duplications.',
  },
  {
    id: 'ngram',
    label: 'N-gram Analysis',
    shortLabel: 'N-gram',
    icon: Fingerprint,
    description: 'Detects shared sequences of N consecutive words. Excellent for paraphrased and lightly reworded content.',
  },
  {
    id: 'semantic',
    label: 'Semantic Analysis',
    shortLabel: 'Semantic',
    icon: Brain,
    description: 'Uses contextual embeddings to identify meaning-level similarity, even across synonym substitutions.',
    badge: 'Slower',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
]

const ADVANCED_DEFAULTS = {
  sensitivity: 'medium',   // low | medium | high
  minMatchLen: 5,           // minimum matching phrase length (words)
  excludeQuotes: false,
  excludeReferences: true,
}

export default function AlgorithmSelector({ value = 'auto', onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advanced, setAdvanced] = useState(ADVANCED_DEFAULTS)
  const [tooltip, setTooltip] = useState(null) // algorithm id to show tooltip for
  const dropdownRef = useRef(null)

  const selected = ALGORITHMS.find((a) => a.id === value) || ALGORITHMS[0]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setTooltip(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (id) => {
    onChange?.(id)
    setIsOpen(false)
    setTooltip(null)
  }

  const updateAdvanced = (key, val) => setAdvanced((prev) => ({ ...prev, [key]: val }))

  const SelectedIcon = selected.icon

  return (
    <div className="flex flex-col gap-3">
      {/* Dropdown trigger */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen((o) => !o)}
            disabled={disabled}
            className={clsx(
              'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors',
              isOpen
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <SelectedIcon size={15} className="text-primary-500 flex-shrink-0" />
              <span>{selected.label}</span>
              {selected.badge && (
                <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-normal', selected.badgeColor)}>
                  {selected.badge}
                </span>
              )}
            </span>
            <ChevronDown
              size={15}
              className={clsx(
                'text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full min-w-[260px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden animate-fade-in">
              <div className="py-1">
                {ALGORITHMS.map((algo) => {
                  const Icon = algo.icon
                  const isSelected = algo.id === value
                  const isTooltipVisible = tooltip === algo.id

                  return (
                    <div key={algo.id} className="relative">
                      <div
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/60',
                        )}
                        onClick={() => handleSelect(algo.id)}
                      >
                        <Icon
                          size={15}
                          className={clsx(
                            'flex-shrink-0',
                            isSelected
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-400',
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={clsx(
                                'text-sm font-medium',
                                isSelected
                                  ? 'text-primary-700 dark:text-primary-300'
                                  : 'text-gray-800 dark:text-gray-200',
                              )}
                            >
                              {algo.label}
                            </span>
                            {algo.badge && (
                              <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', algo.badgeColor)}>
                                {algo.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info icon with tooltip */}
                        <button
                          type="button"
                          className="flex-shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTooltip(isTooltipVisible ? null : algo.id)
                          }}
                          title="Learn more"
                        >
                          <Info size={13} />
                        </button>
                      </div>

                      {/* Inline tooltip */}
                      {isTooltipVisible && (
                        <div className="mx-3 mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in">
                          {algo.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          disabled={disabled}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors flex-shrink-0',
            showAdvanced
              ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-400'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          title="Advanced options"
        >
          <Settings2 size={14} />
          <span className="hidden sm:inline">Advanced</span>
        </button>
      </div>

      {/* Description of selected algorithm */}
      {!isOpen && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <span className="font-medium text-gray-600 dark:text-gray-300">{selected.label}:</span>{' '}
          {selected.description}
        </p>
      )}

      {/* Advanced panel */}
      {showAdvanced && !disabled && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Advanced Options
          </h4>

          {/* Sensitivity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Detection Sensitivity
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateAdvanced('sensitivity', level)}
                  className={clsx(
                    'flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors',
                    advanced.sensitivity === level
                      ? level === 'high'
                        ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400'
                        : level === 'medium'
                        ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-400'
                        : 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800',
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {advanced.sensitivity === 'high'
                ? 'Flags more potential matches — may increase false positives'
                : advanced.sensitivity === 'low'
                ? 'Only flags strong matches — minimizes false positives'
                : 'Balanced detection threshold'}
            </p>
          </div>

          {/* Min match length */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-between">
              Min. Match Length
              <span className="font-bold text-gray-800 dark:text-gray-100">{advanced.minMatchLen} words</span>
            </label>
            <input
              type="range"
              min={3}
              max={15}
              value={advanced.minMatchLen}
              onChange={(e) => updateAdvanced('minMatchLen', Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Phrases shorter than this will not be flagged as matches
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2.5">
            {[
              {
                key: 'excludeQuotes',
                label: 'Exclude quoted text',
                note: 'Skip content wrapped in quotation marks',
              },
              {
                key: 'excludeReferences',
                label: 'Exclude reference lists',
                note: 'Skip bibliography and citation sections',
              },
            ].map(({ key, label, note }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => updateAdvanced(key, !advanced[key])}
                  className={clsx(
                    'relative mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer',
                    advanced[key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
                  )}
                >
                  <div
                    className={clsx(
                      'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                      advanced[key] && 'translate-x-4',
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{note}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

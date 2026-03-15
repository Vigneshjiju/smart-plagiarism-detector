import { useRef, useCallback, useEffect, useState } from 'react'
import { Loader2, Clipboard, X, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const CHAR_LIMIT = 10000
const WORD_LIMIT = 10000
const MIN_WORDS = 10
const CHAR_WARN_THRESHOLD = 0.85 // show warning at 85% of limit

export default function TextInput({ value, onChange, isLoading, onSubmit }) {
  const textareaRef = useRef(null)
  const [pasteSuccess, setPasteSuccess] = useState(false)
  const [pasteError, setPasteError] = useState(false)

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length
  const isOverCharLimit = charCount > CHAR_LIMIT
  const isOverWordLimit = wordCount > WORD_LIMIT
  const isOverLimit = isOverCharLimit || isOverWordLimit
  const isTooShort = wordCount < MIN_WORDS && value.trim().length > 0
  const isNearCharLimit = charCount >= CHAR_LIMIT * CHAR_WARN_THRESHOLD && !isOverCharLimit
  const charUsedPct = Math.min((charCount / CHAR_LIMIT) * 100, 100)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 500)}px`
  }, [value])

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isLoading && !isOverLimit && wordCount >= MIN_WORDS) {
        onSubmit()
      }
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
      setPasteSuccess(true)
      setTimeout(() => setPasteSuccess(false), 2000)
    } catch {
      setPasteError(true)
      setTimeout(() => setPasteError(false), 2000)
    }
  }

  const clearText = () => onChange('')

  return (
    <div className="flex flex-col gap-3">
      <div
        className={clsx(
          'relative rounded-xl border-2 transition-colors bg-white dark:bg-gray-800',
          isOverLimit
            ? 'border-red-400 dark:border-red-500'
            : isNearCharLimit
            ? 'border-yellow-400 dark:border-yellow-500'
            : 'border-gray-200 dark:border-gray-600 focus-within:border-primary-400 dark:focus-within:border-primary-500',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            'Paste or type your text here to check for plagiarism...\n\nTips:\n• Minimum 10 words required\n• Maximum 10,000 characters\n• Press Ctrl+Enter to start check'
          }
          className="w-full min-h-[280px] p-4 pr-20 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none font-sans leading-relaxed scrollbar-thin overflow-y-auto"
          style={{ maxHeight: '500px' }}
          disabled={isLoading}
          spellCheck
        />

        {/* Top-right action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {!value && (
            <button
              onClick={handlePaste}
              disabled={isLoading}
              className={clsx(
                'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
                pasteSuccess
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : pasteError
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
              title="Paste from clipboard"
            >
              <Clipboard size={12} />
              {pasteSuccess ? 'Pasted!' : pasteError ? 'Denied' : 'Paste'}
            </button>
          )}
          {value && (
            <button
              onClick={clearText}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Clear text"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Char progress bar at bottom of textarea */}
        {charCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <div
              className={clsx(
                'h-full transition-all duration-300',
                isOverCharLimit
                  ? 'bg-red-500'
                  : isNearCharLimit
                  ? 'bg-yellow-400'
                  : 'bg-primary-400',
              )}
              style={{ width: `${charUsedPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Counter + warning row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          {/* Char counter */}
          <span
            className={clsx(
              isOverCharLimit && 'text-red-600 dark:text-red-400 font-medium',
              isNearCharLimit && !isOverCharLimit && 'text-yellow-600 dark:text-yellow-400 font-medium',
            )}
          >
            {charCount.toLocaleString()} / {CHAR_LIMIT.toLocaleString()} chars
          </span>

          {/* Word counter */}
          <span className={clsx(isOverWordLimit && 'text-red-600 dark:text-red-400 font-medium')}>
            {wordCount.toLocaleString()} words
          </span>

          {/* Inline warnings */}
          {isOverCharLimit && (
            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle size={11} />
              Over character limit
            </span>
          )}
          {!isOverCharLimit && isNearCharLimit && (
            <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle size={11} />
              {CHAR_LIMIT - charCount} chars remaining
            </span>
          )}
          {isTooShort && !isOverLimit && (
            <span className="text-yellow-600 dark:text-yellow-400">
              Need at least {MIN_WORDS} words
            </span>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || isOverLimit || wordCount < MIN_WORDS}
          className="btn-primary px-6 py-2.5"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Check Plagiarism
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Tip: Press{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
          Ctrl+Enter
        </kbd>{' '}
        to run a quick check
      </p>
    </div>
  )
}

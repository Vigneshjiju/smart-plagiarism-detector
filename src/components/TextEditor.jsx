import { useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const WORD_LIMIT = 10000
const MIN_WORDS = 10

export default function TextEditor({ value, onChange, isLoading, onSubmit }) {
  const textareaRef = useRef(null)
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length
  const isOverLimit = wordCount > WORD_LIMIT
  const isTooShort = wordCount < MIN_WORDS && value.trim().length > 0

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

  const handlePaste = (e) => {
    // Allow paste
  }

  const clearText = () => onChange('')

  return (
    <div className="flex flex-col gap-3">
      <div
        className={clsx(
          'relative rounded-xl border-2 transition-colors bg-white dark:bg-gray-800',
          isOverLimit
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-600 focus-within:border-primary-400 dark:focus-within:border-primary-500',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Paste or type your text here to check for plagiarism...&#10;&#10;Tips:&#10;• Minimum 10 words required&#10;• Maximum 10,000 words&#10;• Press Ctrl+Enter to start check"
          className="w-full min-h-[280px] max-h-[500px] p-4 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-y focus:outline-none font-sans leading-relaxed scrollbar-thin"
          disabled={isLoading}
          spellCheck
        />
        {value && (
          <button
            onClick={clearText}
            className="absolute top-3 right-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Clear text"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className={clsx(isOverLimit && 'text-red-600 dark:text-red-400 font-medium')}>
            {wordCount.toLocaleString()} / {WORD_LIMIT.toLocaleString()} words
          </span>
          <span>{charCount.toLocaleString()} chars</span>
          {isTooShort && (
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Check Plagiarism
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+Enter</kbd> to run a quick check
      </p>
    </div>
  )
}

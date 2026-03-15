import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

const ACCEPTED_TYPES = {
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/pdf': ['.pdf'],
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export default function FileUpload({ onTextExtracted, fileName, onClear, isLoading }) {
  const [progress, setProgress] = useState(0) // 0-100
  const [isReading, setIsReading] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'success'|'error', message }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsReading(true)
      setProgress(0)

      try {
        const text = await readFileText(file, (pct) => setProgress(pct))
        onTextExtracted(text, file.name)
        setProgress(100)
        showNotification('success', `"${file.name}" loaded successfully`)
      } catch (err) {
        console.error('File read error:', err)
        showNotification('error', `Failed to read "${file.name}". Try another file.`)
      } finally {
        setIsReading(false)
        setTimeout(() => setProgress(0), 600)
      }
    },
    [onTextExtracted],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: isLoading || isReading,
  })

  const hasError = fileRejections.length > 0
  const rejectionMsg =
    fileRejections[0]?.errors[0]?.code === 'file-too-large'
      ? 'File exceeds 10 MB limit'
      : fileRejections[0]?.errors[0]?.code === 'file-invalid-type'
      ? 'Unsupported file type (use .txt, .doc, .docx, .pdf)'
      : fileRejections[0]?.errors[0]?.message || 'Invalid file'

  // Loaded state
  if (fileName && !isReading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={11} className="text-green-500" />
                  File loaded successfully
                </p>
              </div>
            </div>
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && <Toast notification={notification} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
            : hasError
            ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
            : isReading
            ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10 cursor-default'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-800',
          (isLoading || isReading) && 'opacity-70',
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div
            className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center',
              isDragActive
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'
                : hasError
                ? 'bg-red-100 dark:bg-red-900/40 text-red-500'
                : isReading
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
            )}
          >
            {hasError ? (
              <AlertCircle size={28} />
            ) : isReading ? (
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16" cy="16" r="12"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    className="text-primary-200 dark:text-primary-800"
                  />
                  <circle
                    cx="16" cy="16" r="12"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${(progress / 100) * 75.4} 75.4`}
                    className="text-primary-500 transition-all duration-150"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary-600 dark:text-primary-400">
                  {progress}%
                </span>
              </div>
            ) : (
              <Upload size={28} />
            )}
          </div>

          {isReading ? (
            <div className="w-full max-w-xs flex flex-col items-center gap-2">
              <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                Reading file...
              </p>
              {/* Linear progress bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{progress}% complete</p>
            </div>
          ) : isDragActive ? (
            <p className="text-primary-600 dark:text-primary-400 font-medium">Drop file here...</p>
          ) : (
            <>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Drag &amp; drop a file, or{' '}
                  <span className="text-primary-600 dark:text-primary-400">browse</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supports .txt, .doc, .docx, .pdf &mdash; max{' '}
                  <span className="font-medium">10 MB</span>
                </p>
              </div>
            </>
          )}

          {hasError && !isReading && (
            <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              {rejectionMsg}
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {notification && <Toast notification={notification} />}
    </div>
  )
}

function Toast({ notification }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in border',
        notification.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      )}
    >
      {notification.type === 'success' ? (
        <CheckCircle2 size={15} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={15} className="flex-shrink-0" />
      )}
      {notification.message}
    </div>
  )
}

async function readFileText(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 90))
      }
    }

    reader.onload = (e) => {
      onProgress(100)

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        resolve(e.target.result)
        return
      }

      // For doc/docx/pdf – extract readable text
      const cleaned = String.fromCharCode(...new Uint8Array(e.target.result))
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim()

      resolve(
        cleaned ||
          `[Could not extract text from ${file.name}. Please paste text manually.]`,
      )
    }

    reader.onerror = reject

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

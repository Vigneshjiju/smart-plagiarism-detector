import { useDispatch, useSelector } from 'react-redux'
import { setInputMode, setFileName, setInputText, setAlgorithm } from '../store/plagiarismSlice'
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck'
import TextInput from '../components/TextInput'
import FileUpload from '../components/FileUpload'
import AlgorithmSelector from '../components/AlgorithmSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Type } from 'lucide-react'
import clsx from 'clsx'

export default function Checker() {
  const dispatch = useDispatch()
  const { inputText, inputMode, fileName, algorithm, isChecking } = useSelector(
    (s) => s.plagiarism,
  )
  const { runCheck, updateText } = usePlagiarismCheck()

  const handleFileText = (text, name) => {
    dispatch(setFileName(name))
    dispatch(setInputText(text))
  }

  const handleClearFile = () => {
    dispatch(setFileName(null))
    dispatch(setInputText(''))
  }

  const handleModeToggle = (mode) => {
    dispatch(setInputMode(mode))
    if (mode === 'text') {
      dispatch(setFileName(null))
    }
    updateText('')
  }

  if (isChecking) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto py-8">
        <LoadingSpinner message="Analyzing your text for plagiarism..." size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plagiarism Checker</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Paste your text or upload a document to check for plagiarism and duplicate content.
        </p>
      </div>

      <div className="card p-6 flex flex-col gap-6">
        {/* Mode tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
            <button
              onClick={() => handleModeToggle('text')}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
                inputMode === 'text'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              )}
            >
              <Type size={15} />
              Paste Text
            </button>
            <button
              onClick={() => handleModeToggle('file')}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
                inputMode === 'file'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              )}
            >
              <FileText size={15} />
              Upload File
            </button>
          </div>
        </div>

        {/* Algorithm selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Detection Algorithm
          </label>
          <AlgorithmSelector
            value={algorithm}
            onChange={(id) => dispatch(setAlgorithm(id))}
            disabled={isChecking}
          />
        </div>

        {/* Input area */}
        <div>
          {inputMode === 'text' ? (
            <TextInput
              value={inputText}
              onChange={updateText}
              isLoading={isChecking}
              onSubmit={() => runCheck(inputText)}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <FileUpload
                onTextExtracted={handleFileText}
                fileName={fileName}
                onClear={handleClearFile}
                isLoading={isChecking}
              />
              {inputText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Extracted Text Preview
                    </p>
                    <span className="text-xs text-gray-400">
                      {inputText.split(/\s+/).length.toLocaleString()} words
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 scrollbar-thin">
                    {inputText.slice(0, 500)}
                    {inputText.length > 500 ? '...' : ''}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => runCheck(inputText)}
                      disabled={isChecking}
                      className="btn-primary px-6 py-2.5"
                    >
                      Check Plagiarism
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Supported Formats', value: 'TXT, DOC, DOCX, PDF' },
          { label: 'Max File Size', value: '10 MB' },
          { label: 'Max Characters', value: '10,000' },
        ].map((info) => (
          <div key={info.label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{info.label}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {info.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

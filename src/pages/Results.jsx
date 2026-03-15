import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, RefreshCw, FileSearch, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { resetChecker } from '../store/plagiarismSlice'
import SimilarityMeter from '../components/SimilarityMeter'
import HighlightedText from '../components/HighlightedText'
import SourceCard from '../components/SourceCard'
import { formatDate, getScoreColor, getScoreLabel, downloadJSON, downloadText, generateReportText } from '../utils/formatters'
import clsx from 'clsx'
import { useState } from 'react'

const StatusIcon = ({ status }) => {
  if (status === 'high') return <XCircle className="text-red-500" size={20} />
  if (status === 'medium') return <AlertTriangle className="text-yellow-500" size={20} />
  return <CheckCircle2 className="text-green-500" size={20} />
}

export default function Results() {
  const dispatch = useDispatch()
  const { results } = useSelector((s) => s.plagiarism)
  const [activeTab, setActiveTab] = useState('overview')

  if (!results) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileSearch size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
          No Results Yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Run a plagiarism check to see your results here.
        </p>
        <Link to="/checker" className="btn-primary">
          <FileSearch size={16} />
          Go to Checker
        </Link>
      </div>
    )
  }

  const colors = getScoreColor(results.overallScore)

  const handleDownloadJSON = () => downloadJSON(results, `plagiarism-report-${results.id}.json`)
  const handleDownloadText = () => downloadText(generateReportText(results), `plagiarism-report-${results.id}.txt`)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sources', label: `Sources (${results.sources.length})` },
    { id: 'highlight', label: 'Highlighted Text' },
  ]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/checker"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Checked on {formatDate(results.processedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadText} className="btn-secondary text-sm px-3 py-2">
            <Download size={14} />
            TXT
          </button>
          <button onClick={handleDownloadJSON} className="btn-secondary text-sm px-3 py-2">
            <Download size={14} />
            JSON
          </button>
          <Link
            to="/checker"
            onClick={() => dispatch(resetChecker())}
            className="btn-primary text-sm px-3 py-2"
          >
            <RefreshCw size={14} />
            New Check
          </Link>
        </div>
      </div>

      {/* Score summary */}
      <div className={clsx('card p-6 mb-6 border-2', colors.border)}>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <SimilarityMeter score={results.overallScore} size="lg" />
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Unique Content', value: `${results.uniqueScore}%`, color: 'text-green-600 dark:text-green-400' },
              { label: 'Word Count', value: results.wordCount.toLocaleString(), color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Sentences', value: results.sentenceCount.toLocaleString(), color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Sources Found', value: results.sources.length.toString(), color: 'text-red-600 dark:text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <p className={clsx('text-xl font-bold mt-1', stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={clsx('mt-5 p-4 rounded-xl flex items-start gap-3', colors.bg)}>
          <StatusIcon status={results.status} />
          <div>
            <p className={clsx('font-semibold text-sm', colors.text)}>{getScoreLabel(results.overallScore)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{results.summary}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Similarity Breakdown</h3>

          {results.sources.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={36} className="text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No matching sources found. Your content appears original!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.sources.map((source) => (
                <div key={source.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{source.title}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 w-32">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={clsx(
                          'h-2 rounded-full',
                          source.similarity >= 70 ? 'bg-red-500' : source.similarity >= 40 ? 'bg-yellow-500' : 'bg-green-500',
                        )}
                        style={{ width: `${source.similarity}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-8 text-right">
                      {source.similarity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="space-y-3 animate-fade-in">
          {results.sources.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle2 size={36} className="text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No sources matched. Your text is unique!</p>
            </div>
          ) : (
            results.sources.map((source, i) => (
              <SourceCard key={source.id} source={source} rank={i + 1} />
            ))
          )}
        </div>
      )}

      {activeTab === 'highlight' && (
        <div className="card p-6 animate-fade-in">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Hover over highlighted sections to see matching source details.
          </p>
          <HighlightedText text={results.inputText || ''} segments={results.segments} />
        </div>
      )}
    </div>
  )
}

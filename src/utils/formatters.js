/**
 * Utility helpers for formatting data
 */

export const formatScore = (score) => `${Math.round(score)}%`

export const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatRelativeTime = (isoString) => {
  const now = Date.now()
  const date = new Date(isoString).getTime()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(isoString)
}

export const formatWordCount = (count) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

export const getScoreColor = (score) => {
  if (score >= 70) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'badge-red', hex: '#ef4444' }
  if (score >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'badge-yellow', hex: '#f59e0b' }
  if (score >= 15) return { text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'badge-yellow', hex: '#f97316' }
  return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'badge-green', hex: '#22c55e' }
}

export const getScoreLabel = (score) => {
  if (score >= 70) return 'High Plagiarism'
  if (score >= 40) return 'Moderate Plagiarism'
  if (score >= 15) return 'Low Plagiarism'
  return 'Original'
}

export const getCategoryIcon = (category) => {
  const icons = {
    encyclopedia: '📚',
    academic: '🎓',
    report: '📄',
    literature: '📖',
    website: '🌐',
    news: '📰',
  }
  return icons[category] || '🔗'
}

export const truncateText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export const downloadJSON = (data, filename = 'plagiarism-report.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const downloadText = (text, filename = 'report.txt') => {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const generateReportText = (results) => {
  const lines = [
    '=== PLAGIARISM CHECK REPORT ===',
    `Date: ${formatDate(results.processedAt)}`,
    `Overall Plagiarism Score: ${results.overallScore}%`,
    `Unique Content: ${results.uniqueScore}%`,
    `Word Count: ${results.wordCount}`,
    `Character Count: ${results.characterCount}`,
    `Sentences Analyzed: ${results.sentenceCount}`,
    `Status: ${getScoreLabel(results.overallScore)}`,
    '',
    '--- SUMMARY ---',
    results.summary,
    '',
    '--- MATCHED SOURCES ---',
    ...results.sources.map(
      (s, i) => `${i + 1}. ${s.title} (${s.similarity}%)\n   URL: ${s.url}`,
    ),
    '',
    '=== END OF REPORT ===',
  ]
  return lines.join('\n')
}

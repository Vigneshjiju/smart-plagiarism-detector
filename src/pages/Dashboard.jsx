import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import StatsCard from '../components/StatsCard'
import SimilarityMeter from '../components/SimilarityMeter'
import {
  BarChart2, FileText, AlertTriangle, CheckCircle2, TrendingUp,
  FileSearch, Clock, XCircle,
} from 'lucide-react'
import { formatRelativeTime, getScoreColor } from '../utils/formatters'
import clsx from 'clsx'

export default function Dashboard() {
  const { allItems, stats } = useHistory()

  const recentItems = allItems.slice(0, 5)

  const scoreDistribution = useMemo(() => {
    if (allItems.length === 0) return []
    const bins = [
      { range: '0–10%', count: 0, color: 'bg-green-500' },
      { range: '10–30%', count: 0, color: 'bg-lime-500' },
      { range: '30–50%', count: 0, color: 'bg-yellow-500' },
      { range: '50–70%', count: 0, color: 'bg-orange-500' },
      { range: '70–100%', count: 0, color: 'bg-red-500' },
    ]
    allItems.forEach((item) => {
      const s = item.overallScore
      if (s < 10) bins[0].count++
      else if (s < 30) bins[1].count++
      else if (s < 50) bins[2].count++
      else if (s < 70) bins[3].count++
      else bins[4].count++
    })
    return bins
  }, [allItems])

  const maxBin = Math.max(...scoreDistribution.map((b) => b.count), 1)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Overview of all your plagiarism checks
        </p>
      </div>

      {allItems.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <BarChart2 size={28} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Data Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Run your first plagiarism check to see analytics.
          </p>
          <Link to="/checker" className="btn-primary">
            <FileSearch size={16} />
            Start Checking
          </Link>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Total Checks"
              value={stats.total}
              icon={FileText}
              color="blue"
              description="All time"
            />
            <StatsCard
              label="Average Score"
              value={`${stats.avgScore}%`}
              icon={TrendingUp}
              color={stats.avgScore >= 70 ? 'red' : stats.avgScore >= 30 ? 'yellow' : 'green'}
              description="Plagiarism rate"
            />
            <StatsCard
              label="High Risk"
              value={stats.high}
              icon={XCircle}
              color="red"
              description="Score ≥ 70%"
            />
            <StatsCard
              label="Clean Docs"
              value={stats.low}
              icon={CheckCircle2}
              color="green"
              description="Score < 30%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Score distribution chart */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Score Distribution</h3>
              <div className="space-y-3">
                {scoreDistribution.map((bin) => (
                  <div key={bin.range} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                      {bin.range}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                      <div
                        className={clsx('h-4 rounded-full transition-all duration-500', bin.color)}
                        style={{ width: `${(bin.count / maxBin) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6 text-right">
                      {bin.count}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Total: {allItems.length} check{allItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Risk gauge */}
            <div className="card p-6 flex flex-col items-center justify-center text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 self-start">
                Overall Risk Level
              </h3>
              <SimilarityMeter score={stats.avgScore} size="lg" />
              <div className="mt-4 grid grid-cols-3 gap-4 w-full">
                {[
                  { label: 'High Risk', value: stats.high, color: 'text-red-600 dark:text-red-400' },
                  { label: 'Medium', value: stats.medium, color: 'text-yellow-600 dark:text-yellow-400' },
                  { label: 'Clean', value: stats.low, color: 'text-green-600 dark:text-green-400' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent checks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Checks</h3>
              <Link
                to="/history"
                className="text-sm text-primary-600 hover:underline dark:text-primary-400"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => {
                const colors = getScoreColor(item.overallScore)
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={clsx('text-2xl font-bold w-14 text-center', colors.text)}>
                      {item.overallScore}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Clock size={11} />
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {item.wordCount} words
                        </span>
                      </div>
                    </div>
                    <span className={clsx('badge flex-shrink-0', colors.badge)}>
                      {item.overallScore >= 70 ? 'High' : item.overallScore >= 30 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

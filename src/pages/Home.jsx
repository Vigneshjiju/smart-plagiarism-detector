import { Link } from 'react-router-dom'
import { ShieldCheck, Zap, BarChart2, Clock, ArrowRight, FileSearch } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Analysis',
    desc: 'Get plagiarism results in seconds using advanced n-gram fingerprinting and Jaccard similarity algorithms.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Detection',
    desc: 'Multi-layer analysis combining tri-gram matching, rolling hash fingerprints, and word-level comparison.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: BarChart2,
    title: 'Detailed Reports',
    desc: 'Visual similarity meters, highlighted matched segments, and source attribution with direct links.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Clock,
    title: 'Check History',
    desc: 'All your plagiarism checks are saved locally. Filter, search, and revisit past results anytime.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
]

const stats = [
  { label: 'Algorithms Used', value: '3+' },
  { label: 'Reference Sources', value: '8+' },
  { label: 'File Formats', value: '4' },
  { label: 'Max Words', value: '10K' },
]

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
          <ShieldCheck size={14} />
          AI-Powered Plagiarism Detection
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Smart{' '}
          <span className="bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
            Plagiarism
          </span>{' '}
          Checker
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Detect duplicate content instantly with multi-algorithm analysis. Paste text or upload
          documents — get a detailed similarity report with source attribution in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/checker" className="btn-primary text-base px-8 py-3">
            <FileSearch size={18} />
            Start Checking
            <ArrowRight size={16} />
          </Link>
          <Link to="/dashboard" className="btn-secondary text-base px-8 py-3">
            <BarChart2 size={18} />
            View Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow duration-200">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon size={24} className={f.color} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How-to steps */}
      <section className="py-12">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            3 Simple Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste or Upload', desc: 'Enter your text directly or upload a .txt, .doc, .docx, or .pdf file up to 5 MB.' },
              { step: '02', title: 'Run Analysis', desc: 'Our engine scans up to 10,000 words using n-gram fingerprinting and cosine similarity.' },
              { step: '03', title: 'Review Report', desc: 'View highlighted matches, source URLs, similarity percentages, and download your report.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 text-center">
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to check your content?</h2>
          <p className="text-primary-100 mb-6 max-w-md mx-auto">
            Free, fast, and intelligent plagiarism detection. No account required.
          </p>
          <Link
            to="/checker"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

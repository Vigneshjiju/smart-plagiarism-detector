import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-primary-200 dark:text-primary-900 select-none mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link to="/" className="btn-primary">
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}

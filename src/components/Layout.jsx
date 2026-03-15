import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setDarkMode } from '../store/uiSlice'
import Navbar from './Navbar'

export default function Layout() {
  const dispatch = useDispatch()
  const { darkMode } = useSelector((state) => state.ui)

  useEffect(() => {
    // Apply dark mode class on mount
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 PlagiarismIQ — Smart Plagiarism Checker
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Powered by AI-driven text analysis
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

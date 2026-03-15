import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { setInputText, resetChecker, checkPlagiarism } from '../store/plagiarismSlice'

export const usePlagiarismCheck = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { inputText, isChecking, results, error } = useSelector((state) => state.plagiarism)

  const runCheck = async (text) => {
    const checkText = text || inputText

    if (!checkText || checkText.trim().length < 50) {
      toast.error('Please enter at least 50 characters to check.')
      return
    }

    try {
      // Thunk manages isChecking / results / error state and history persistence
      await dispatch(checkPlagiarism({ text: checkText })).unwrap()
      toast.success('Plagiarism check complete!')
      navigate('/results')
    } catch (err) {
      const msg = err?.message || 'Analysis failed. Please try again.'
      toast.error(msg)
    }
  }

  const updateText = (text) => {
    dispatch(setInputText(text))
  }

  const reset = () => {
    dispatch(resetChecker())
  }

  return {
    inputText,
    isChecking,
    results,
    error,
    runCheck,
    updateText,
    reset,
  }
}

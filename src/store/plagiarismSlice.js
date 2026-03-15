import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { plagiarismService } from '../services/plagiarismService'
import { addHistoryItem } from './historySlice'

// ─── async thunk ─────────────────────────────────────────────────────────────

/**
 * checkPlagiarism({ text, options? })
 *
 * Manages the full analysis lifecycle via RTK's pending/fulfilled/rejected cases.
 * The calling hook only needs to handle navigation and toast side effects.
 */
export const checkPlagiarism = createAsyncThunk(
  'plagiarism/check',
  async ({ text, options = {} }, thunkAPI) => {
    const { algorithm } = thunkAPI.getState().plagiarism

    const results = await plagiarismService.checkText(text, { ...options, algorithm })

    // Persist to history as a thunk side-effect so the hook stays clean
    thunkAPI.dispatch(
      addHistoryItem({
        text: text.substring(0, 200) + (text.length > 200 ? '\u2026' : ''),
        overallScore: results.overallScore,
        uniqueScore: results.uniqueScore,
        wordCount: results.wordCount,
        status: results.status,
        sourceCount: results.sources.length,
        results,
      }),
    )

    return results
  },
)

// ─── slice ────────────────────────────────────────────────────────────────────

const initialState = {
  inputText: '',
  inputMode: 'text', // 'text' | 'file'
  fileName: null,
  algorithm: 'auto', // 'auto' | 'cosine' | 'jaccard' | 'ngram' | 'semantic'
  isChecking: false,
  results: null,
  error: null,
  checkId: null,
}

const plagiarismSlice = createSlice({
  name: 'plagiarism',
  initialState,
  reducers: {
    setInputText(state, action) {
      state.inputText = action.payload
    },
    setInputMode(state, action) {
      state.inputMode = action.payload
    },
    setFileName(state, action) {
      state.fileName = action.payload
    },
    setAlgorithm(state, action) {
      state.algorithm = action.payload
    },
    // Manual reducers retained for components that dispatch them directly
    startChecking(state) {
      state.isChecking = true
      state.error = null
      state.results = null
    },
    setResults(state, action) {
      state.isChecking = false
      state.results = action.payload
      state.checkId = action.payload?.id || null
    },
    setError(state, action) {
      state.isChecking = false
      state.error = action.payload
    },
    resetChecker(state) {
      state.inputText = ''
      state.inputMode = 'text'
      state.fileName = null
      state.isChecking = false
      state.results = null
      state.error = null
      state.checkId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPlagiarism.pending, (state) => {
        state.isChecking = true
        state.error = null
        state.results = null
      })
      .addCase(checkPlagiarism.fulfilled, (state, action) => {
        state.isChecking = false
        state.results = action.payload
        state.checkId = action.payload?.id || null
      })
      .addCase(checkPlagiarism.rejected, (state, action) => {
        state.isChecking = false
        state.error = action.error.message || 'Analysis failed. Please try again.'
      })
  },
})

export const {
  setInputText,
  setInputMode,
  setFileName,
  setAlgorithm,
  startChecking,
  setResults,
  setError,
  resetChecker,
} = plagiarismSlice.actions

export default plagiarismSlice.reducer

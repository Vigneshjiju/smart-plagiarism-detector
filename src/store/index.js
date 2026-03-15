import { configureStore } from '@reduxjs/toolkit'
import plagiarismReducer from './plagiarismSlice'
import historyReducer from './historySlice'
import uiReducer from './uiSlice'
import comparisonReducer from './comparisonSlice'
import documentReducer from './documentSlice'

export const store = configureStore({
  reducer: {
    plagiarism: plagiarismReducer,
    history: historyReducer,
    ui: uiReducer,
    comparison: comparisonReducer,
    document: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'plagiarism/setResults',
          'plagiarism/check/fulfilled',
          'document/process/pending',
          'document/process/fulfilled',
        ],
      },
    }),
})

export default store

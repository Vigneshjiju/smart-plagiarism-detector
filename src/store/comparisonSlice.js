import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ─── helpers (inline so this slice stays self-contained) ─────────────────────

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)

const ngrams = (tokens, n = 3) => {
  const result = []
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '))
  }
  return result
}

const jaccardSimilarity = (setA, setB) => {
  const a = new Set(setA)
  const b = new Set(setB)
  const intersection = new Set([...a].filter((x) => b.has(x)))
  const union = new Set([...a, ...b])
  return union.size === 0 ? 0 : intersection.size / union.size
}

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

const fingerprint = (text, windowSize = 5) => {
  const tokens = tokenize(text)
  return new Set(ngrams(tokens, windowSize).map(simpleHash))
}

/**
 * Compute per-algorithm similarity scores between two texts (0–100).
 */
const computeScores = (textA, textB, algorithms) => {
  const tokA = tokenize(textA)
  const tokB = tokenize(textB)

  const wordSetA = new Set(tokA)
  const wordSetB = new Set(tokB)

  const ngram2A = new Set(ngrams(tokA, 2))
  const ngram2B = new Set(ngrams(tokB, 2))

  const ngram3A = new Set(ngrams(tokA, 3))
  const ngram3B = new Set(ngrams(tokB, 3))

  const fpA = fingerprint(textA)
  const fpB = fingerprint(textB)

  const raw = {
    cosine: jaccardSimilarity(ngram2A, ngram2B) * 0.6 + jaccardSimilarity(wordSetA, wordSetB) * 0.4,
    jaccard: jaccardSimilarity(wordSetA, wordSetB),
    ngram: jaccardSimilarity(ngram3A, ngram3B),
    fingerprint: jaccardSimilarity(fpA, fpB),
    // semantic is mocked (requires embeddings not available client-side)
    semantic:
      (jaccardSimilarity(wordSetA, wordSetB) * 0.5 +
        jaccardSimilarity(ngram2A, ngram2B) * 0.3 +
        jaccardSimilarity(ngram3A, ngram3B) * 0.2) *
      1.15,
  }

  const scores = {}
  for (const alg of algorithms) {
    scores[alg] = Math.min(Math.round((raw[alg] ?? raw.jaccard) * 2 * 100), 100)
  }
  return scores
}

/**
 * Find phrases shared between textA and textB.
 * Returns up to 10 matching phrases with their positions.
 */
const findMatchingPhrases = (textA, textB, minLen = 4) => {
  const tokA = tokenize(textA)
  const tokB = tokenize(textB)
  const setB = new Set(ngrams(tokB, minLen))
  const matches = []

  for (let i = 0; i <= tokA.length - minLen; i++) {
    const phrase = tokA.slice(i, i + minLen).join(' ')
    if (setB.has(phrase)) {
      matches.push(phrase)
    }
  }

  // deduplicate and cap
  return [...new Set(matches)].slice(0, 10)
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// ─── async thunk ─────────────────────────────────────────────────────────────

/**
 * runComparison({ textA, textB })
 * The algorithms to use are read from state via getState().comparison.algorithms.
 */
export const runComparison = createAsyncThunk(
  'comparison/run',
  async ({ textA, textB }, thunkAPI) => {
    const { algorithms } = thunkAPI.getState().comparison

    // Simulate network latency for a realistic UX feel
    await delay(600 + Math.random() * 500)

    if (!textA?.trim() || !textB?.trim()) {
      return thunkAPI.rejectWithValue('Both texts are required for comparison.')
    }

    const scores = computeScores(textA, textB, algorithms)
    const scoreValues = Object.values(scores)
    const overallSimilarity =
      scoreValues.length > 0
        ? Math.round(scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length)
        : 0

    const matchingPhrases = findMatchingPhrases(textA, textB)
    const tokA = tokenize(textA)
    const tokB = tokenize(textB)

    return {
      id: `comp_${Date.now()}`,
      overallSimilarity,
      scores,
      algorithms,
      matchingPhrases,
      textAStats: {
        wordCount: tokA.length,
        charCount: textA.length,
        sentenceCount: (textA.match(/[^.!?]+[.!?]*/g) || []).length,
      },
      textBStats: {
        wordCount: tokB.length,
        charCount: textB.length,
        sentenceCount: (textB.match(/[^.!?]+[.!?]*/g) || []).length,
      },
      processedAt: new Date().toISOString(),
    }
  },
)

// ─── slice ────────────────────────────────────────────────────────────────────

const MAX_HISTORY = 30

const initialState = {
  /** 'idle' | 'loading' | 'succeeded' | 'failed' */
  status: 'idle',
  error: null,
  /** Full result object from the last runComparison call */
  result: null,
  /** Which algorithms will be used in the next runComparison */
  algorithms: ['cosine', 'jaccard', 'ngram'],
  /**
   * Past comparison summaries (lightweight – no full texts stored)
   * Shape: { id, timestamp, overallSimilarity, algorithms, textAPreview, textBPreview }
   */
  history: [],
}

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    setAlgorithms(state, action) {
      state.algorithms = action.payload
    },
    toggleAlgorithm(state, action) {
      const id = action.payload
      const idx = state.algorithms.indexOf(id)
      if (idx === -1) {
        state.algorithms.push(id)
      } else if (state.algorithms.length > 1) {
        // always keep at least one
        state.algorithms.splice(idx, 1)
      }
    },
    clearResult(state) {
      state.result = null
      state.status = 'idle'
      state.error = null
    },
    removeComparisonFromHistory(state, action) {
      state.history = state.history.filter((h) => h.id !== action.payload)
    },
    clearComparisonHistory(state) {
      state.history = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runComparison.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.result = null
      })
      .addCase(runComparison.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.result = action.payload

        // Prepend a lightweight summary to history
        const summary = {
          id: action.payload.id,
          timestamp: action.payload.processedAt,
          overallSimilarity: action.payload.overallSimilarity,
          algorithms: action.payload.algorithms,
          textAWordCount: action.payload.textAStats.wordCount,
          textBWordCount: action.payload.textBStats.wordCount,
        }
        state.history.unshift(summary)
        if (state.history.length > MAX_HISTORY) {
          state.history = state.history.slice(0, MAX_HISTORY)
        }
      })
      .addCase(runComparison.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Comparison failed'
      })
  },
})

export const {
  setAlgorithms,
  toggleAlgorithm,
  clearResult,
  removeComparisonFromHistory,
  clearComparisonHistory,
} = comparisonSlice.actions

export default comparisonSlice.reducer

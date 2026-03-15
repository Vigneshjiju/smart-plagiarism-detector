import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ─── file-reading helper ──────────────────────────────────────────────────────

/**
 * Reads a File object and returns its text content.
 * Accepts plain text natively; binary formats (PDF, DOCX) fall back to
 * a light-weight text-extraction pass.
 */
const extractText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        resolve(e.target.result)
        return
      }

      // Heuristic text extraction for binary formats
      const cleaned = String.fromCharCode(...new Uint8Array(e.target.result))
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim()

      resolve(
        cleaned ||
          `[Could not extract text from "${file.name}". Please paste text manually.]`,
      )
    }

    reader.onerror = () => reject(new Error(`Failed to read "${file.name}"`))

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })

const countWords = (text) =>
  text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0

const countSentences = (text) => (text.match(/[^.!?]+[.!?]+/g) || []).length

// ─── async thunk (optimistic) ────────────────────────────────────────────────

/**
 * processDocument({ file, docId })
 *
 * Optimistic flow:
 *   pending   → add stub doc with status 'processing'  (optimistic insert)
 *   fulfilled → update stub with extracted text + metadata
 *   rejected  → mark stub as 'error' (allows retry / rollback display)
 */
export const processDocument = createAsyncThunk(
  'document/process',
  async ({ file, docId }, thunkAPI) => {
    try {
      const text = await extractText(file)
      return {
        id: docId,
        text,
        wordCount: countWords(text),
        charCount: text.length,
        sentenceCount: countSentences(text),
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to process file')
    }
  },
)

// ─── slice ────────────────────────────────────────────────────────────────────

/**
 * Document metadata shape:
 * {
 *   id          : string          – caller-supplied (e.g. crypto.randomUUID())
 *   name        : string          – original file name
 *   size        : number          – bytes
 *   type        : string          – MIME type
 *   uploadedAt  : ISO string
 *   text        : string | null   – extracted text (null while processing)
 *   wordCount   : number
 *   charCount   : number
 *   sentenceCount: number
 *   status      : 'processing' | 'ready' | 'error'
 *   error       : string | null
 * }
 */
const initialState = {
  documents: [],
  activeDocumentId: null,
  /** Global processing status – reflects the latest processDocument call */
  status: 'idle', // 'idle' | 'processing' | 'ready' | 'error'
  error: null,
}

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setActiveDocument(state, action) {
      state.activeDocumentId = action.payload
    },
    removeDocument(state, action) {
      state.documents = state.documents.filter((d) => d.id !== action.payload)
      if (state.activeDocumentId === action.payload) {
        state.activeDocumentId = state.documents[0]?.id ?? null
      }
    },
    clearDocuments(state) {
      state.documents = []
      state.activeDocumentId = null
      state.status = 'idle'
      state.error = null
    },
    /** Manually update a doc's text (e.g. after user edits) */
    updateDocumentText(state, action) {
      const { id, text } = action.payload
      const doc = state.documents.find((d) => d.id === id)
      if (doc) {
        doc.text = text
        doc.wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
        doc.charCount = text.length
        doc.sentenceCount = (text.match(/[^.!?]+[.!?]+/g) || []).length
      }
    },
    /** Retry a failed document – resets status so processDocument can be dispatched again */
    retryDocument(state, action) {
      const doc = state.documents.find((d) => d.id === action.payload)
      if (doc && doc.status === 'error') {
        doc.status = 'processing'
        doc.error = null
        doc.text = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── optimistic insert ────────────────────────────────────────────────
      .addCase(processDocument.pending, (state, action) => {
        const { file, docId } = action.meta.arg
        state.status = 'processing'

        // Insert the optimistic stub only if not already present (handles retries)
        const existing = state.documents.find((d) => d.id === docId)
        if (!existing) {
          state.documents.push({
            id: docId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            text: null,
            wordCount: 0,
            charCount: 0,
            sentenceCount: 0,
            status: 'processing',
            error: null,
          })
        } else {
          existing.status = 'processing'
          existing.error = null
        }

        // Auto-select if first document
        if (!state.activeDocumentId) {
          state.activeDocumentId = docId
        }
      })
      // ── success: hydrate stub ────────────────────────────────────────────
      .addCase(processDocument.fulfilled, (state, action) => {
        state.status = 'ready'
        const doc = state.documents.find((d) => d.id === action.payload.id)
        if (doc) {
          doc.text = action.payload.text
          doc.wordCount = action.payload.wordCount
          doc.charCount = action.payload.charCount
          doc.sentenceCount = action.payload.sentenceCount
          doc.status = 'ready'
          doc.error = null
        }
      })
      // ── error: mark stub, allow retry ────────────────────────────────────
      .addCase(processDocument.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload ?? action.error.message ?? 'Processing failed'
        const { docId } = action.meta.arg
        const doc = state.documents.find((d) => d.id === docId)
        if (doc) {
          doc.status = 'error'
          doc.error = state.error
        }
      })
  },
})

export const {
  setActiveDocument,
  removeDocument,
  clearDocuments,
  updateDocumentText,
  retryDocument,
} = documentSlice.actions

export default documentSlice.reducer

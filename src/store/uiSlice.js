import { createSlice } from '@reduxjs/toolkit'

// ─── helpers ─────────────────────────────────────────────────────────────────

let _notifCounter = 0
const nextNotifId = () => `notif_${Date.now()}_${++_notifCounter}`

// ─── initial state ────────────────────────────────────────────────────────────

const initialState = {
  // ── theme ──────────────────────────────────────────────────────────────
  darkMode: localStorage.getItem('darkMode') === 'true',

  // ── layout ─────────────────────────────────────────────────────────────
  sidebarOpen: false,
  activeTab: 'text', // 'text' | 'file'

  // ── notifications ───────────────────────────────────────────────────────
  /**
   * Shape: {
   *   id       : string
   *   type     : 'info' | 'success' | 'warning' | 'error'
   *   message  : string
   *   duration : number   (ms, 0 = permanent until dismissed)
   * }
   */
  notifications: [],

  // ── modals ──────────────────────────────────────────────────────────────
  /**
   * Each modal is an object with at minimum { open: boolean }
   * plus optional payload fields merged via openModal.
   */
  modals: {
    settings: { open: false },
    export: { open: false, format: 'json', checkId: null },
    deleteConfirm: { open: false, targetId: null, targetType: null },
  },

  // ── keyed loading states ─────────────────────────────────────────────────
  /**
   * Fine-grained loading flags keyed by operation name.
   * E.g. { history_fetch: true, export_abc123: true }
   */
  loadingStates: {},
}

// ─── slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ── theme ────────────────────────────────────────────────────────────
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', String(state.darkMode))
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload
      localStorage.setItem('darkMode', String(action.payload))
      if (action.payload) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    // ── layout ───────────────────────────────────────────────────────────
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload
    },

    // ── notifications ────────────────────────────────────────────────────
    addNotification: {
      reducer(state, action) {
        state.notifications.push(action.payload)
        if (state.notifications.length > 5) {
          state.notifications.shift()
        }
      },
      prepare({ type = 'info', message, duration = 4000 }) {
        return { payload: { id: nextNotifId(), type, message, duration } }
      },
    },
    dismissNotification(state, action) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearNotifications(state) {
      state.notifications = []
    },

    // ── modals ───────────────────────────────────────────────────────────
    openModal(state, action) {
      const { name, payload = {} } = action.payload
      if (state.modals[name] !== undefined) {
        state.modals[name] = { ...state.modals[name], ...payload, open: true }
      }
    },
    closeModal(state, action) {
      const name = action.payload
      if (state.modals[name] !== undefined) {
        state.modals[name].open = false
      }
    },
    closeAllModals(state) {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key].open = false
      })
    },

    // ── keyed loading states ─────────────────────────────────────────────
    setLoadingState(state, action) {
      const { key, loading } = action.payload
      if (loading) {
        state.loadingStates[key] = true
      } else {
        delete state.loadingStates[key]
      }
    },
    clearLoadingStates(state) {
      state.loadingStates = {}
    },
  },
})

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  setActiveTab,
  addNotification,
  dismissNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions

export default uiSlice.reducer

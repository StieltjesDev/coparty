import { computed, reactive } from 'vue'
import { checkAuth, logout as logoutRequest } from '@/services/auth'
import { usePlayerStore } from '@/stores/player'

const state = reactive({
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
})

let pendingSessionRequest = null

async function fetchSession(force = false) {
  if (pendingSessionRequest && !force) {
    return pendingSessionRequest
  }

  state.loading = true
  pendingSessionRequest = checkAuth()
    .then(({ data }) => {
      state.user = data?.user ?? data ?? null
      state.isAuthenticated = true
      state.initialized = true
      return state.user
    })
    .catch(() => {
      state.user = null
      state.isAuthenticated = false
      state.initialized = true
      return null
    })
    .finally(() => {
      state.loading = false
      pendingSessionRequest = null
    })

  return pendingSessionRequest
}

function clearSession() {
  state.user = null
  state.isAuthenticated = false
  state.initialized = true
  usePlayerStore().clearPlayer()
}

async function logout() {
  try {
    await logoutRequest()
  } finally {
    clearSession()
  }
}

export function useAuthStore() {
  return {
    state,
    isAuthenticated: computed(() => state.isAuthenticated),
    fetchSession,
    clearSession,
    logout,
  }
}

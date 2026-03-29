import { computed, reactive } from 'vue'
import { checkAuth, logout as logoutRequest, updateUser as updateUserRequest } from '@/services/auth'
import { usePlayerStore } from '@/stores/player'

const state = reactive({
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
})

let pendingSessionRequest = null

function setSession(user) {
  state.user = user ?? null
  state.isAuthenticated = Boolean(user)
  state.initialized = true
  return state.user
}

async function fetchSession(force = false) {
  if (pendingSessionRequest && !force) {
    return pendingSessionRequest
  }

  state.loading = true
  pendingSessionRequest = checkAuth()
    .then(({ data }) => setSession(data?.user ?? data ?? null))
    .catch(() => {
      setSession(null)
      return null
    })
    .finally(() => {
      state.loading = false
      pendingSessionRequest = null
    })

  return pendingSessionRequest
}

function clearSession() {
  setSession(null)
  usePlayerStore().clearPlayer()
}

async function logout() {
  try {
    await logoutRequest()
  } finally {
    clearSession()
  }
}

async function updateCurrentUser(payload) {
  if (!state.user?.id) {
    throw new Error('Usuario nao autenticado')
  }

  const { data } = await updateUserRequest(state.user.id, payload)
  return setSession(data ?? null)
}

export function useAuthStore() {
  return {
    state,
    isAuthenticated: computed(() => state.isAuthenticated),
    setSession,
    fetchSession,
    clearSession,
    logout,
    updateCurrentUser,
  }
}

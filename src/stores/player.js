import { computed, reactive } from 'vue'
import { createPlayer as createPlayerRequest, getMyPlayer } from '@/services/players'

const state = reactive({
  player: null,
  initialized: false,
  loading: false,
})

let pendingPlayerRequest = null

async function fetchMyPlayer(force = false) {
  if (pendingPlayerRequest && !force) {
    return pendingPlayerRequest
  }

  state.loading = true
  pendingPlayerRequest = getMyPlayer()
    .then(({ data }) => {
      state.player = data ?? null
      state.initialized = true
      return state.player
    })
    .catch((error) => {
      if (error?.response?.status === 404) {
        state.player = null
        state.initialized = true
        return null
      }

      throw error
    })
    .finally(() => {
      state.loading = false
      pendingPlayerRequest = null
    })

  return pendingPlayerRequest
}

async function createMyPlayer(payload) {
  const { data } = await createPlayerRequest(payload)
  state.player = data
  state.initialized = true
  return data
}

async function ensureMyPlayer() {
  const currentPlayer = await fetchMyPlayer()
  if (currentPlayer) {
    return currentPlayer
  }

  return createMyPlayer({})
}

function clearPlayer() {
  state.player = null
  state.initialized = false
  state.loading = false
}

export function usePlayerStore() {
  return {
    state,
    player: computed(() => state.player),
    hasPlayer: computed(() => Boolean(state.player)),
    fetchMyPlayer,
    createMyPlayer,
    ensureMyPlayer,
    clearPlayer,
  }
}

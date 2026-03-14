import api from '@/api'

export function getMyPlayer() {
  return api.get('/players/me')
}

export function createPlayer(payload) {
  return api.post('/players', payload)
}

export function updatePlayer(id, payload) {
  return api.put(`/players/${id}`, payload)
}

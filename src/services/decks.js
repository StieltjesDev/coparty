import api from '@/api'

export function listMyDecks() {
  return api.get('/decks/me')
}

export function getDeck(id) {
  return api.get(`/decks/${id}`)
}

export function createDeck(payload) {
  return api.post('/decks/me', payload)
}

export function updateDeck(id, payload) {
  return api.put(`/decks/${id}`, payload)
}

export function deleteDeckById(id) {
  return api.delete(`/decks/${id}`)
}

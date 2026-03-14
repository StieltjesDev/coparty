import api from '@/api'

export function getPlayerRankings(params = {}) {
  return api.get('/rankings/players', { params })
}

export function getDeckRankings(params = {}) {
  return api.get('/rankings/decks', { params })
}

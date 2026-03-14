import api from '@/api'

export function rebuildAll() {
  return api.post('/admin/rebuild')
}

export function rebuildEvent(eventId) {
  return api.post(`/admin/rebuild/event/${eventId}`)
}

export function rebuildRound(eventId, round) {
  return api.post(`/admin/rebuild/round/${eventId}/${round}`)
}

export function rebuildMatch(matchId) {
  return api.post(`/admin/rebuild/match/${matchId}`)
}

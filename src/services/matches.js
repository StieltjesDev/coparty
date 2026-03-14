import api from '@/api'

export function getMatch(id) {
  return api.get(`/matches/${id}`)
}

export function submitMatchResult(id, participants) {
  return api.patch(`/matches/${id}/result`, { participants })
}

export function updateMatchStatus(id, status) {
  return api.patch(`/matches/${id}/status`, { status })
}

export function reopenMatch(id) {
  return api.patch(`/matches/${id}/reopen`)
}

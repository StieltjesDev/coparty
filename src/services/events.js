import api from '@/api'

export function listEvents() {
  return api.get('/events')
}

export function getEvent(id) {
  return api.get(`/events/${id}`)
}

export function createEvent(payload) {
  return api.post('/events', payload)
}

export function updateEvent(id, payload) {
  return api.put(`/events/${id}`, payload)
}

export function deleteEventById(id) {
  return api.delete(`/events/${id}`)
}

export function joinEvent(eventId, payload) {
  return api.post(`/events/${eventId}/entries`, payload)
}

export function leaveEvent(eventId) {
  return api.delete(`/events/${eventId}/entries/me`)
}

export function removeEventEntry(eventId, entryId) {
  return api.delete(`/events/${eventId}/entries/${entryId}`)
}

export function dropEventEntry(eventId, entryId) {
  return api.patch(`/events/${eventId}/entries/${entryId}/drop`)
}

export function getEventEntries(eventId) {
  return api.get(`/events/${eventId}/entries`)
}

export function getEventMatches(eventId) {
  return api.get(`/events/${eventId}/matches`)
}

export function generateRound(eventId, round) {
  return api.post(`/events/${eventId}/rounds/${round}/generate`)
}

export function getRound(eventId, round) {
  return api.get(`/events/${eventId}/rounds/${round}`)
}

export function closeRound(eventId, round) {
  return api.post(`/events/${eventId}/rounds/${round}/close`)
}

export function startEvent(eventId) {
  return api.patch(`/events/${eventId}/start`)
}

export function cancelEvent(eventId) {
  return api.patch(`/events/${eventId}/cancel`)
}

export function finishEvent(eventId) {
  return api.patch(`/events/${eventId}/finish`)
}

export function getStandings(eventId) {
  return api.get(`/events/${eventId}/standings`)
}

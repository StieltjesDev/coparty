import api from '@/api'

export function checkAuth() {
  return api.get('/users/check-auth')
}

export function login(payload) {
  return api.post('/users/login', payload)
}

export function signup(payload) {
  return api.post('/users', payload)
}

export function logout() {
  return api.post('/users/logout')
}

export function updateUser(id, payload) {
  return api.put(`/users/${id}`, payload)
}

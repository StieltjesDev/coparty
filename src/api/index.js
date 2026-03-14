import axios from 'axios'

let unauthorizedHandler = null

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
})

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error?.message
    const shouldHandleUnauthorized = status === 401 || (
      status === 403 && ['Token nao fornecido', 'Token invalido', 'Nao autenticado'].includes(message)
    )

    if (shouldHandleUnauthorized && unauthorizedHandler) {
      await unauthorizedHandler(error)
    }

    return Promise.reject(error)
  }
)

export default api

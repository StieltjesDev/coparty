// src/api/index.js
import axios from 'axios'

// Cria uma instância configurada do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true // 🔑 envia os cookies automaticamente
})

// Intercepta respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o back retornar 401 (não autenticado)
    if (error.response && error.response.status === 401) {
      // Redireciona o usuário pro login
      window.location.href = '#/login'
    }
    return Promise.reject(error)
  }
)

export default api

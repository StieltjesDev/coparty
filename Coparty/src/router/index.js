// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Importar suas páginas
import LoginForm from '../components/LoginForm.vue'
import EventForm from '../components/EventForm.vue'
import Signup from '../components/Signup.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginForm },
  { path: '/evento', name: 'Evento', component: EventForm },
  { path: '/signup', name: 'Signup', component: Signup }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

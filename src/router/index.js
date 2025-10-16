import { createRouter, createWebHashHistory  } from 'vue-router'
import api from '@/api'

import LoginForm from '../components/LoginForm.vue'
import EventForm from '../components/EventForm.vue'
import Signup from '../components/Signup.vue'
import EventList from '../components/EventList.vue'
import DeckForm from '../components/decks/DeckForm.vue'
import DeckList from '../components/decks/DeckList.vue'

const routes = [
  { path: '/', name: 'Home', component: EventList },
  { path: '/create', name: 'Evento', component: EventForm, meta: { requiresAuth: true } },
  { path: '/edit/:id', name: 'Editar Evento', component: EventForm, meta: { requiresAuth: true } },
  { path: '/decks/create', name: 'Criar Deck', component: DeckForm, meta: { requiresAuth: true } },
  { path: '/decks/edit/:id', name: 'Editar Deck', component: DeckForm, meta: { requiresAuth: true } },
  { path: '/decks', name: 'Decks', component: DeckList, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/signup', name: 'Signup', component: Signup }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const res = await api.get('/users/check-auth')
      if (res.status === 200) next()
      else next('/#/login')
    } catch {
      next('/#/login')
    }
  } else next()
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import { setUnauthorizedHandler } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

import LoginForm from '@/components/login/LoginForm.vue'
import Signup from '@/components/login/Signup.vue'
import EventList from '@/components/event/EventList.vue'
import EventForm from '@/components/event/EventForm.vue'
import EventDetails from '@/components/event/EventDetails.vue'
import DeckForm from '@/components/decks/DeckForm.vue'
import DeckList from '@/components/decks/DeckList.vue'
import MatchDetails from '@/components/matches/MatchDetails.vue'
import PlayerRankings from '@/components/rankings/PlayerRankings.vue'
import DeckRankings from '@/components/rankings/DeckRankings.vue'
import AdminPanel from '@/components/admin/AdminPanel.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  { path: '/', redirect: '/events' },
  { path: '/events', name: 'events-list', component: EventList, meta: { requiresAuth: true } },
  { path: '/events/create', name: 'events-create', component: EventForm, meta: { requiresAuth: true } },
  { path: '/events/:id', name: 'events-detail', component: EventDetails, meta: { requiresAuth: true } },
  { path: '/events/:id/edit', name: 'events-edit', component: EventForm, meta: { requiresAuth: true } },
  { path: '/decks', name: 'decks-list', component: DeckList, meta: { requiresAuth: true, requiresPlayer: true } },
  { path: '/decks/create', name: 'decks-create', component: DeckForm, meta: { requiresAuth: true, requiresPlayer: true } },
  { path: '/decks/:id/edit', name: 'decks-edit', component: DeckForm, meta: { requiresAuth: true, requiresPlayer: true } },
  { path: '/matches/:id', name: 'match-detail', component: MatchDetails, meta: { requiresAuth: true } },
  { path: '/rankings/players', name: 'rankings-players', component: PlayerRankings, meta: { requiresAuth: true } },
  { path: '/rankings/decks', name: 'rankings-decks', component: DeckRankings, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/login', name: 'login', component: LoginForm },
  { path: '/signup', name: 'signup', component: Signup },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setUnauthorizedHandler(async () => {
  const auth = useAuthStore()
  auth.clearSession()

  if (router.currentRoute.value.name !== 'login') {
    await router.push({ name: 'login' })
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const playerStore = usePlayerStore()

  if (!to.meta.requiresAuth) {
    return true
  }

  const user = auth.state.isAuthenticated && auth.state.user
    ? auth.state.user
    : await auth.fetchSession()
  if (!user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && user.role !== 'admin') {
    return { name: 'events-list' }
  }

  if (to.meta.requiresPlayer) {
    const player = playerStore.state.player
      ? playerStore.state.player
      : await playerStore.fetchMyPlayer()
    if (!player) {
      return { name: 'profile', query: { bootstrap: 'player', redirect: to.fullPath } }
    }
  }

  return true
})

export default router

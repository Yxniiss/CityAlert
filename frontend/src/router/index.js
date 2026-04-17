import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/homePage.vue'
import RegisterView from '@/views/register.vue'
import LoginView from '@/views/login.vue'
import AdminSpaceView from '@/views/AdminSpace.vue'
import UserSpaceView from '@/views/UserSpace.vue'

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    {
        path: '/adminSpace',
        name: 'adminSpace',
        component: AdminSpaceView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/UserSpace',
        name: 'userSpace',
        component: UserSpaceView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function getTokenPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

router.beforeEach((to, _from, next) => {
  if (!to.meta.requiresAuth) return next()

  const token = localStorage.getItem('token')
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return next('/login')
  }

  if (to.meta.requiresAdmin) {
    const payload = getTokenPayload(token)
    if (!payload || payload.role !== 'admin') {
      return next('/UserSpace')
    }
  }

  next()
})

export default router

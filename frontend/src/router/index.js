import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/homePage.vue'
import RegisterView from '@/views/register.vue'
import LoginView from '@/views/login.vue'
import AdminSpaceView from '@/views/AdminSpace.vue'
import UserSpaceView from '@/views/UserSpace.vue'


const routes =  [
    {
        path: '/',
        name: 'home',
        component : HomeView
    },
    {
        path: '/register',
        name: 'register',
        component : RegisterView
    },
    {
        path: '/login',
        name: 'login',
        component : LoginView
    },
    {
        path: '/adminSpace',
        name: 'adminSpace',
        component : AdminSpaceView
    },
    {
        path: '/UserSpace',
        name: 'userSpace',
        component : UserSpaceView
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

const PROTECTED = ['/UserSpace', '/adminSpace']

router.beforeEach((to, _from, next) => {
  if (!PROTECTED.includes(to.path)) return next()

  const token = localStorage.getItem('token')
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return next('/login')
  }
  next()
})

export default router
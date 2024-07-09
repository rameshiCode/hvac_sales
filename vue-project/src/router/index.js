import { createRouter, createWebHistory } from 'vue-router'
import PingView from '../views/PingView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PingView
    },
    {
      path: '/ping',
      name: 'ping',
      component: PingView
    }
  ]
})

export default router

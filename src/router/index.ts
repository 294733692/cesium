import { createRouter, createWebHistory } from 'vue-router'
import viewer from '@/views/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: viewer
    },
  ]
})

export default router

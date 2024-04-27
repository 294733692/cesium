import { createRouter, createWebHistory } from 'vue-router'
import viewer from '@/views/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: viewer,
      children: [
        {
          path: '/imageryLayer',
          name: 'imageryLayer',
          component: import('@/views/base/ImageryLayer.vue')
        }
      ]
    },
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import TargetListing from '@/views/TargetListing.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'TargetListing',
      component: TargetListing,
    },
    {
      path: '/target/:id/details',
      name: 'TargetDetail',
      component: () => import('@/views/TargetDetail.vue')
    }
  ],
})

export default router

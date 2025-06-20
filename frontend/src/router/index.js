import { createRouter, createWebHistory } from 'vue-router'

import UserProfileView from '@/views/UserProfileView.vue'
// import FollowListView from '@/views/FollowListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/',
      name: 'login',
     component: () => import('../views/Login.vue')
      path: '/UserProfile',
      name: 'UserProfile',
      component: UserProfileView,
    },
    // {
    //   // path: '/FollowList',
    //   name: 'FollowList',
    //   component: FollowListView,
    // },
  ],
})

export default router

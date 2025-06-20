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
    },
    {
      path: '/UserProfile',
      name: 'UserProfile',
      component: UserProfileView,
    },

    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),

    },

    {
      path: '/myProfile',
      name: 'myProfile',
         component: () => import('../views/2View.vue')
      // component: () => import('../views/myProfile.vue'),
    },


  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

import UserProfileView from '@/views/UserProfileView.vue'
// import FollowListView from '@/views/FollowListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/',
      name: 'login',
     component: () => import('../views/Login.vue'),
     meta: { hideHeaderFooter: true }
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
meta: { hideHeaderFooter: true }
    },

    {
      path: '/myProfile',
      name: 'myProfile',
         component: () => import('../views/2View.vue')
      // component: () => import('../views/myProfile.vue'),
    },
    {
      path: '/TimeLine',
      name: 'TimeLine',
         component: () => import('../views/TimeLine.vue')
      // component: () => import('../views/myProfile.vue'),
    },


  ],
})

export default router

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
      path: '/MyProfile',
      name: 'MyProfile',
      component: () => import('../views/MyProfileView.vue')
    },
    {
      path: '/UserProfile',
      name: 'UserProfile',
      component: () => import('../views/UserProfileView.vue')
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


  ],
})

export default router

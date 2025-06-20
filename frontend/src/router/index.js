import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
     component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
       component: () => import('../views/1View.vue')
      // component: () => import('../views/RegisterView.vue'),
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

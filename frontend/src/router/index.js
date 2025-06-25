import { createRouter, createWebHistory } from 'vue-router'


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
      path: '/ProfileEdit',
      name: 'ProfileEdit',
      component: () => import('../views/ProfileEdit.vue')
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
      path: '/post',
      name: 'post',
       component: () => import('../views/MyPost.vue')
    },
    {
      path: '/TimeLine',
      name: 'TimeLine',
      component: () => import('../views/TimeLine.vue')
      // component: () => import('../views/myProfile.vue'),
    },
    {
      path: '/followlist',
      name: 'followlist',
      component: () => import('../views/FollowListView.vue'),
    },
    {
    path: '/user/:userId',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue'),
     props: true // userNameをUserProfileViewのpropsとして渡すため追加
    },
    {
      path: '/search', // 検索画面へのパス
      name: 'Search', // ルートの名前
      component: () => import('../views/SearchView.vue') // SearchView.vueのインポート
    },
  ],
})

export default router

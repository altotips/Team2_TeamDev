import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { createPinia } from 'pinia'

const pinia = createPinia() // Piniaのインスタンスを作成

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { hideHeaderFooter: true },
    },
    {
      path: '/MyProfile',
      name: 'MyProfile',
      component: () => import('../views/MyProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ProfileEdit',
      name: 'ProfileEdit',
      component: () => import('../views/ProfileEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { hideHeaderFooter: true },
    },
    {
      path: '/post',
      name: 'post',
      component: () => import('../views/Mypost.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/TimeLine',
      name: 'TimeLine',
      component: () => import('../views/TimeLine.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/AllTimeLine',
      name: 'AllTimeLine',
      component: () => import('../views/AllTimeLine.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/followlist',
      name: 'followlist',
      component: () => import('../views/FollowListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/:userId',
      name: 'UserProfile',
      component: () => import('@/views/UserProfileView.vue'),
      meta: { requiresAuth: true },
      props: true, // userNameをUserProfileViewのpropsとして渡すため追加
    },
    {
      path: '/search', // 検索画面へのパス
      name: 'Search', // ルートの名前
      component: () => import('../views/SearchView.vue'), // SearchView.vueのインポート
      meta: { requiresAuth: true },
    },
    {
      path: '/search/:tag?',
      name: 'Search',
      component: () => import('../views/SearchView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// ルーターガード設定
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  await new Promise((resolve) => setTimeout(resolve, 0))

  console.log('to.name:', to.name)
  console.log('userStore.isLoggedIn:', userStore.isLoggedIn)

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router

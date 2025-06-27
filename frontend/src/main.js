import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

// ストア復元が完了するまで router を遅延させる
import { useUserStore } from '@/stores/userStore.js'
const userStore = useUserStore()

// Pinia のストア状態が復元されるのを待ってから router をマウント
Promise.resolve().then(() => {
  app.use(router)
  app.mount('#app')
})

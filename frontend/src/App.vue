<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import Header from './views/Header.vue'
import Footer from './views/Footer.vue'
import ToastMessage from '@/views/ToastMessage.vue'
import { useToast } from '@/composables/useToast.js'

const route = useRoute()
const { toastMessage, showToast, showToastMessage } = useToast()
</script>

<template>
  <div class="container">
    <!-- route?.meta で安全にアクセス -->
    <Header v-if="!route.meta?.hideHeaderFooter" />
    <main class="app-main">
      <RouterView />
    </main>
    <ToastMessage :message="toastMessage" v-if="showToast" />
    <Footer v-if="!route.meta?.hideHeaderFooter" />
  </div>
</template>

<style scoped>
  .container {
    /* position: relative; */
    max-width: 50%;
    width: 100%;
    margin: 0 auto;
    /* 中央に寄せる */
    padding: 0 1rem;
    /* 少し左右に余白 */
    box-sizing: border-box;
  }

  .app-main {
    min-height: 60vh;
    /* 中身が少なすぎても高さ保つ */
    padding-top: 60px;
  }
</style>
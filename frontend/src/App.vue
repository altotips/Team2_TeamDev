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
  <div>
    <!-- route?.meta で安全にアクセス -->
    <Header v-if="!route.meta?.hideHeaderFooter" />
    <main class="app-main">
      <RouterView />
    </main>
    <ToastMessage :message="toastMessage" v-if="showToast" />
    <Footer v-if="!route.meta?.hideHeaderFooter" />
  </div>
</template>

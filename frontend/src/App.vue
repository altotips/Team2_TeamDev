<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Header from './views/Header.vue'
import Footer from './views/Footer.vue'

const route = useRoute()
</script>

<template>
  <div>
    <!-- route?.meta で安全にアクセス -->
    <Header v-if="!route.meta?.hideHeaderFooter" />

    <main class="app-main">
      <RouterView />
    </main>

    <Footer v-if="!route.meta?.hideHeaderFooter" />
  </div>
</template>

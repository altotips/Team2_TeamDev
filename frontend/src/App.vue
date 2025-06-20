<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './views/Header.vue'
import Footer from './views/Footer.vue'
</script>

<template>
  <Header />
  <div>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
  <Footer />
</template>

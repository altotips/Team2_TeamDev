<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Header from './views/Header.vue'
import Footer from './views/Footer.vue'
</script>

<template>
  <Header />
  <RouterView />
  <Footer />
</template>

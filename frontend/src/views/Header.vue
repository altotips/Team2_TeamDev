<template>
  <header class="header">
    <h1 class="title">Hexagram</h1>
    <span class="username">{{ userName }}</span>
  </header>
</template>

<script>
  import { useUserStore } from '@/stores/userStore'
  import { computed } from 'vue'

  export default {
    name: 'Header',
    setup() {
      const userStore = useUserStore()
      const userName = computed(() => userStore.userName)
      return { userName }
    }
  }
</script>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 50%;
    /* 最小の幅 */
    max-width: 600px;
    min-width: 600px;
    height: 60px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 1000;
  }

  /* @media (max-width: 768px) {
    .header {
      width: 100%;
    }
  } */



    /* 左端に配置 */
    .title {
      font-family: 'Dancing Script', cursive;
      font-size: 30px;
      font-weight: bold;
      margin-left: 30px;
      /* 左に隙間 */
    }

    .username {
      font-size: 18px;
      color: #333;
      margin-right: 30px;
      /* 右に隙間 */
    }
</style>
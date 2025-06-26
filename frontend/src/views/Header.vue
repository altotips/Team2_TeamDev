<template>
  <header class="header">
    <h1 class="title" @click="toggleMenu">Hexagram</h1>
    <span class="username">{{ userName }}</span>

    <!-- ドロップダウンメニュー -->
    <div v-if="showMenu" class="dropdown">
     <ul class="dropdown-menu">
  <li>
    <router-link :to="{ name: 'TimeLine' }" @click="showMenu = false">フォロー中</router-link>
  </li>
  <li>
    <router-link :to="{ name: 'AllTimeLine' }" @click="showMenu = false">おすすめ</router-link>
  </li>
</ul>
    </div>
  </header>
</template>

<script>
  import { useUserStore } from '@/stores/userStore'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { onMounted, onBeforeUnmount } from 'vue'

  export default {
    name: 'Header',
    setup() {
      const userStore = useUserStore()
      const userName = computed(() => userStore.userName)
      const showMenu = ref(false)
      const router = useRouter()

      const toggleMenu = () => {
        showMenu.value = !showMenu.value
      }

      const goToFollow = () => {
        showMenu.value = false
        router.push({ name: 'TimeLine' })
      }

      const goToRecommend = () => {
        showMenu.value = false
        router.push({ name: 'AllTimeLine' })
      }
      const handleClickOutside = (e) => {
        const menu = document.querySelector('.dropdown')
        const title = document.querySelector('.title')
        if (
          showMenu.value &&
          (!menu || !menu.contains(e.target)) &&
          (!title || !title.contains(e.target))
        ) {
          showMenu.value = false
        }

      }
      onMounted(() => {
        document.addEventListener('click', handleClickOutside)
      })

      onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside)
      })


      return {
        userName,
        showMenu,
        toggleMenu,
        goToFollow,
        goToRecommend,
      }
    },
  }
</script>

<style scoped>
  .header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ccc;
    padding: 0 20px;
    position: relative;
  }

  .title {
    font-family: 'Dancing Script', cursive;
    font-size: 30px;
    font-weight: bold;
    margin-left: 30px;
    cursor: pointer;
    user-select: none;
  }

  .username {
    font-size: 18px;
    color: #333;
    margin-right: 30px;
  }

  .dropdown {
    position: absolute;
    top: 60px;
    left: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #ddd;
    width: 160px;
  }

  .dropdown-menu {
    list-style: none;
    margin: 0;
    padding: 8px 0;
    border-radius: 12px;
  }

  .dropdown-menu li {
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 15px;
    color: #333;
  }

  .dropdown-menu li:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
  }
</style>
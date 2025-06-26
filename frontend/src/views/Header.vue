<template>
  <header class="header">
    <div class="logo-area">
      <h1 class="title" @click="toggleMenu">Hexagram</h1>

      <!-- ロゴの直下にドロップダウンを出す -->
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
    </div>

    <span class="username">{{ userName }}</span>
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
    cursor: pointer;
    user-select: none;
    /* 左に隙間 */
  }

  .username {
    font-size: 18px;
    color: #333;
    margin-right: 30px;
    /* 右に隙間 */
  }

  .logo-area {
    position: relative;
    /* これがポイント！ */
  }

  .dropdown {
    position: absolute;
    top: 100%;
    /* ロゴの真下 */
    left: 0;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #ddd;
    width: 160px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
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
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
  import { useUserStore } from '@/stores/userStore'
  import { computed } from 'vue'

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

<style>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右に要素を振り分け */
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
  padding: 0 20px; /* 左右に余白をつける */
}

/* 左端に配置 */
.title {
  font-family: 'Dancing Script', cursive;
  font-size: 30px;
  font-weight: bold;
  margin-left: 30px;  /* 左に隙間 */
}

.username {
  font-size: 18px;
  color: #333;
  margin-right: 30px; /* 右に隙間 */
}
</style>
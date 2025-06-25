<!-- トースト表示のコンポーネント
ここに送られてきたメッセージを少しの間、画面上に表示してから消える通知を出す -->

<template>
  <div class="toast">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'

const props = defineProps({
  message: String,
  // duration: {
  //   type: Number,
  //   default: 1000, // ミリ秒
  // },
})

// const visible = ref(false)

// watch(
//   () => props.message,
//   (newMessage) => {
//     if (newMessage) {
//       visible.value = true
//       setTimeout(() => {
//         visible.value = false
//       }, props.duration)
//     }
//   },
//   { immediate: true },
// )
</script>

<style scoped>
.toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #3f3e3e;      /* シンプルな濃いグレー */
  color: #fff;                 /* 白文字 */
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(45, 44, 44, 0.25);
  z-index: 1000;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.03em;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 0.95;
  animation: fadeInUp 0.3s ease forwards;
  user-select: none;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 0.95;
    transform: translateX(-50%) translateY(0);
  }
}
</style>

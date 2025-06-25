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
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #828282;
  color: yellow;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: opacity 0.3s ease;
  opacity: 0.95;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}
</style>

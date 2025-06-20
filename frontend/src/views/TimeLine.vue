<template>
  <div class="post">
    <!-- ユーザー情報 -->
    <div class="post-header">
      <img class="user-icon" :src="post.user.urlIcon" alt="User Icon" />
      <span class="user-name">{{ post.user.userName }}</span>
    </div>

    <!-- 投稿写真 -->
    <img class="post-image" :src="post.urlPhoto" alt="投稿画像" />

    <!-- アクションボタン -->
    <div class="post-actions">
      <!-- いいね -->
      <button @click="toggleLike" class="icon-button">
        <span :style="{ color: isLiked ? 'red' : '#aaa' }">❤️</span>
      </button>

      <!-- コメント -->
      <button @click="toggleComment" class="icon-button">
        💬
      </button>
    </div>

    <!-- コメント欄 -->
    <CommentBox v-if="showComment" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentBox from './CommentBox.vue'

// ▼ 仮の投稿データ（実際は親コンポーネントからpropsで受け取る想定）
const post = {
  id: 1,
  urlPhoto: 'https://placehold.jp/500x300.png',
  user: {
    id: 101,
    userName: 'yamada_taro',
    fullName: '山田 太郎',
    urlIcon: 'https://placehold.jp/30x30.png',
  },
  content: 'おいしいランチ！',
}

// ▼ 状態（いいね・コメント表示）
const isLiked = ref(false)
const showComment = ref(false)

// ▼ 操作関数
const toggleLike = () => {
  isLiked.value = !isLiked.value
}

const toggleComment = () => {
  showComment.value = !showComment.value
}
</script>

<style scoped>
.post {
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 500px;
  margin: 20px auto;
  background: white;
  padding: 12px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.user-name {
  font-weight: bold;
}

.post-image {
  width: 100%;
  border-radius: 4px;
  margin-bottom: 8px;
}

.post-actions {
  display: flex;
  gap: 12px;
  padding: 0 8px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}
</style>

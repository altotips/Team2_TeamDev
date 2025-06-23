<template>
  <div class="timeline">
    <div v-for="post in posts" :key="post.id" class="post-card">
      <!-- ユーザー情報 -->
      <div class="post-header">
        <img class="user-icon" :src="post.user.urlIcon" alt="User Icon" />
        <router-link
  :to="{ name: 'UserProfile', params: { userName: post.user.userName } }"
  class="user-name"
>
  {{ post.user.userName }}
</router-link>
      </div>

      <!-- 投稿画像 -->
      <img class="post-image" :src="post.urlPhoto" alt="投稿画像" />

      <!-- アクション -->
      <div class="post-actions">
        <button @click="toggleLike(post)" class="icon-button">
          <span :style="{ color: post.liked ? 'red' : '#aaa' }">
            {{ post.liked ? '❤️' : '♡' }}
          </span>
        </button>
        <button @click="toggleComment(post.id)" class="icon-button">
          💬 コメント
        </button>
      </div>

      <!-- 投稿テキスト -->
      <p class="post-content">{{ post.content }}</p>

      <!-- コメント欄 -->
      <div v-if="showComment[post.id]" class="comment-section">
        <div v-for="comment in post.comments" :key="comment.id" class="comment">
          <strong>{{ comment.user.userName }}:</strong> {{ comment.content }}
        </div>
        <form @submit.prevent="submitComment(post.id)" class="comment-form">
          <input v-model="newComments[post.id]" type="text" placeholder="コメント..." />
          <button type="submit">送信</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useUserStore } from '@/stores/userStore'

// ストア読み込み
const postStore = usePostStore()
const userStore = useUserStore()

// 投稿リストは followersPosts（フォロー中）か allPosts に差し替え
const posts = computed(() => postStore.allPosts) // or postStore.followersPosts

const showComment = reactive({})
const newComments = reactive({})

// データ取得
onMounted(async () => {
  await postStore.fetchAllPosts()
})

// いいね処理（API呼び出し付き）
const toggleLike = async (post) => {
  post.liked = !post.liked
  if (post.liked) {
    await postStore.addGood(post.id)
  } else {
    await postStore.subGood(post.id)
  }
}

// コメント欄トグル
const toggleComment = (postId) => {
  showComment[postId] = !showComment[postId]
}

// コメント送信
const submitComment = async (postId) => {
  const text = (newComments[postId] || '').trim()
  if (!text) return alert('コメントを入力してください')
  await postStore.addComment(postId, {
    user: await userStore.getUser(userStore.id),
    content: text,
  })
  newComments[postId] = ''
  await postStore.fetchAllPosts()
}
</script>

<style scoped>
.post-card {
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
  margin-bottom: 8px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.comment-section {
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.comment {
  margin-bottom: 6px;
  font-size: 14px;
}

.comment-form {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.comment-form input {
  flex: 1;
  padding: 4px 8px;
}

.comment-form button {
  padding: 4px 10px;
}

.timeline{
padding-bottom: 60px; 
}
</style>



<template>
  <!-- プルリクエスト用コメント -->
  <div class="timeline">
    <div
      v-for="post in posts"
      :key="post.id"
      class="post-card"
    >
      <!-- ユーザー情報 -->
      <div class="post-header">
        <img class="user-icon" :src="post.user.urlIcon" alt="User Icon" />
        <span class="user-name">{{ post.user.userName }}</span>
      </div>

      <!-- 投稿画像 -->
      <img class="post-image" :src="post.urlPhoto" alt="投稿画像" />


      <!-- アクション -->
      <div class="post-actions">
        <!-- いいねボタン -->
        <button @click="toggleLike(post.id)" class="icon-button">
         <span :style="{ color: post.liked ? 'red' : '#aaa' }">
           {{ post.liked ? '❤️' : '♡' }}
         </span>
       </button>


        <!-- コメントボタン -->
        <button @click="toggleComment(post.id)" class="icon-button">💬 コメント</button>
      </div>
      <!-- コンテント表示 -->
      <p class="post-content">{{ post.content }}</p> 

      <!-- コメント欄 -->
      <div v-if="showComment[post.id]" class="comment-section">
        <div
          v-for="comment in post.comments"
          :key="comment.id"
          class="comment"
        >
          <strong>{{ comment.user.userName }}:</strong> {{ comment.content }}
        </div>

        <form @submit.prevent="submitComment(post.id)" class="comment-form">
          <input
            v-model="newComments[post.id]"
            type="text"
            placeholder="コメントを入力..."
          />
          <button type="submit">送信</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// ★ダミーデータ（実際はpostStoreから取得）
const posts = ref([
  {
    id: 1,
    urlPhoto: 'https://placehold.jp/500x300.png',
    user: {
      id: 101,
      userName: 'yamada_taro',
      urlIcon: 'https://placehold.jp/30x30.png',
    },
     content: '今日は美味しいランチを食べました！',
    comments: [
      {
        id: 1,
        user: { userName: 'suzuki_hanako' },
        content: 'いいね！',
      },
    ],
    liked: false,
  },
  {
    id: 2,
    urlPhoto: 'https://placehold.jp/500x300.png',
    user: {
      id: 102,
      userName: 'tanaka_jiro',
      urlIcon: 'https://placehold.jp/30x30.png',
    },
     content: '今日のわんこ🐶！',
    comments: [],
    liked: true,
  },
])

// コメント欄表示管理
const showComment = reactive({})
// コメント入力内容管理
const newComments = reactive({})

// いいねトグル（APIなしのローカル更新バージョン）
const toggleLike = (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return
  post.liked = !post.liked
  // ★将来的にはここで postStore.addGood / subGood を呼ぶ
  console.log(`Post ${postId} liked:`, post.liked)
    posts.value = [...posts.value]
}

// コメント欄の開閉
const toggleComment = (postId) => {
  showComment[postId] = !showComment[postId]
}

// コメント送信（API未実装のためalertのみ）
const submitComment = (postId) => {
  if (!newComments[postId] || !newComments[postId].trim()) {
    alert('コメントを入力してください')
    return
  }
  alert(`コメント送信機能はまだです。\n送信予定コメント: ${newComments[postId]}`)
  // コメントフォームクリア
  newComments[postId] = ''
  // 本来はここで postStore.addComment を呼ぶ
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
</style>



<template>
  <div class="timeline">
    <div v-for="post in posts" :key="post.id" class="post-card">

      <div class="post-header">
        <img class="user-icon" :src="`http://localhost:8080/uploads/${post.user.urlIcon}`" alt="User Icon" />

        <router-link :to="{ name: 'UserProfile', params: { userId: post.user.id } }" class="user-name">
          {{ post.user.userName }}
        </router-link>
      </div>


      <img :src="`http://localhost:8080/uploads/${post.urlPhoto}`" class="post-image" alt="image" />

      <div class="post-actions">

        <button @click="toggleLike(post)" class="icon-button"
          :class="{ liked: post.liked, animate: post.animateHeart }">
          <span :style="{ color: post.liked ? 'red' : '#aaa' }">
            {{ post.liked ? '❤️' : '♡' }}
          </span>
        </button>
        <p>{{ post.good }} </p>
        <button @click="toggleComment(post.id)" class="icon-button">
          💬
        </button>

        <p v-if="Array.isArray(post.comments)">
          {{ post.comments.length }}
        </p>

      </div>

      <p class="post-content">{{ post.content }}</p>

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
    <div v-if="postStore.isLoading" class="loading-message">
      読み込み中...
    </div>
    <div v-else-if="postStore.error" class="error-message">
      エラーが発生しました: {{ postStore.error.message }}
    </div>
    <div v-else-if="posts.length === 0 && !postStore.isLoading" class="no-posts-message">
      まだ投稿がありません。
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

  // 投稿リストは allPosts を使用。必要であれば postStore.followersPosts に差し替え可能
  const posts = computed(() => postStore.followersPosts)

  const showComment = reactive({})
  const newComments = reactive({})

  // データ取得
  onMounted(async () => {
  if (userStore.id) {
    await postStore.fetchFollowersPosts()
  }
})





  // いいね処理（API呼び出し付き）
  const toggleLike = async (post) => {
    if (!userStore.id) {
      alert('ログインしていません。いいねできません。');
      return;
    }
    try {
      if (post.liked) {
        post.good = Math.max(0, post.good - 1) // 最小0を保証
        console.log("マイナスしたよ")
        console.log(post.good)
        await postStore.unGood(post.id)
      } else {
        post.good += 1
        console.log("ぷらすしたよ")
        console.log(post.good)
        await postStore.good(post.id)
      }
      //   if (post.liked) {
      //   post.good += 1
      //   await postStore.good(post.id)
      // } else {
      //    post.good = Math.max(0, post.good - 1) // 最小0を保証
      //   await postStore.unGood(post.id)
      // }
    } catch (error) {
      console.error("いいね処理中にエラー:", error);
      alert("いいね処理中にエラーが発生しました。");
      post.liked = !post.liked; // エラー時はUIを元に戻す
    }

    post.liked = !post.liked // UIを先に更新

    // try {
    //   if (post.liked) {
    //     await postStore.good(postId)
    //   } else {
    //     await postStore.unGood(postId)
    //   }
    // } catch (error) {
    //   console.error("いいね処理中にエラー:", error);
    //   alert("いいね処理中にエラーが発生しました。");
    //   post.liked = !post.liked; // エラー時はUIを元に戻す
    // }
  }

  // コメント欄トグル
  const toggleComment = (postId) => {
    showComment[postId] = !showComment[postId]
  }

  // コメント送信
  const submitComment = async (postId) => {
    if (!userStore.id) {
      alert('ログインしていません。コメントできません。');
      return;
    }

    const text = (newComments[postId] || '').trim()
    if (!text) return alert('コメントを入力してください')

    try {
      await postStore.addComment(postId, {
        user: await userStore.getUser(userStore.id), // コメント送信時もgetUserを使用
        content: text,
      });

      newComments[postId] = '' // コメントフォームクリア
      alert('コメントを送信しました！');
      await postStore.fetchAllPosts(); // コメント送信後、最新のコメントリストを反映するために再フェッチ
    } catch (error) {
      console.error("コメント送信中にエラー:", error);
      alert("コメント送信中にエラーが発生しました。");
    }
  }
</script>

<style scoped>
  .post-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    max-width: 500px;
    margin: 10px auto;
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

  /* .timeline {
    padding-bottom: 60px;
  } */
</style>
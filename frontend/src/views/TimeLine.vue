<template>
  <div class="timeline">
    <div v-for="post in posts" :key="post.id" class="post-card">
      <div class="post-header">
        <img
          class="user-icon"
          :src="
            post.user?.urlIcon
              ? `http://localhost:8080/uploads/${post.user.urlIcon}`
              : '/images/default_profile_icon.png'
          "
          alt="User Icon"
        />

        <router-link
          :to="{ name: 'UserProfile', params: { userId: post.user?.id } }"
          class="user-name"
        >
          {{ post.user?.userName }}
        </router-link>
      </div>

      <img
        :src="
          post.urlPhoto
            ? `http://localhost:8080/uploads/${post.urlPhoto}`
            : '/images/default_post_image.png'
        "
        class="post-image"
        alt="image"
      />

      <div class="post-actions">
        <button
          @click="toggleLike(post)"
          class="icon-button"
          :class="{ liked: post.liked, animate: post.animateHeart }"
        >
          <span :style="{ color: post.liked ? 'red' : '#aaa' }">
            {{ post.liked ? '❤️' : '♡' }}
          </span>
        </button>
        <p>{{ post.good }}</p>
        <button @click="toggleComment(post.id)" class="icon-button">💬</button>

        <p v-if="Array.isArray(post.comments)">
          {{ post.comments.length }}
        </p>
      </div>

      <p class="post-content">
        <template v-for="(word, index) in parseContent(post.content)" :key="index">
          <router-link
            v-if="word.isMention && word.user"
            :to="{ name: 'UserProfile', params: { userId: word.user.id } }"
            class="mention-link"
          >
            {{ word.text }}
          </router-link>
          <router-link
            v-else-if="word.isHashtag"
            :to="{ name: 'Search', query: { q: word.tag } }"
            class="hashtag"
          >
            {{ word.text }}
          </router-link>
          <span v-else>{{ word.text }}</span>
        </template>
      </p>

      <!-- タグ表示（クリック可能なハッシュタグ） -->
      <div class="post-tags" v-if="Array.isArray(post.tagu)">
        <router-link
          v-for="tag in post.tagu"
          :key="tag"
          :to="{ name: 'Search', params: { tag } }"
          class="hashtag"
        >
          #{{ tag }}
        </router-link>
      </div>

      <div v-if="showComment[post.id]" class="comment-section">
        <div v-for="comment in post.comments" :key="comment.id" class="comment">
          <strong>{{ comment.user?.userName }}:</strong> {{ comment.content }}
        </div>
        <form @submit.prevent="submitComment(post.id)" class="comment-form">
          <input v-model="newComments[post.id]" type="text" placeholder="コメント..." />
          <button type="submit">送信</button>
        </form>
      </div>
    </div>
    <div v-if="postStore.isLoading" class="loading-message">読み込み中...</div>
    <div v-else-if="postStore.error" class="error-message">
      エラーが発生しました: {{ postStore.error.message }}
    </div>
    <div v-else-if="posts.length === 0 && !postStore.isLoading" class="no-posts-message">
      ほかのユーザーをフォローして思い出をシェアしよう！！
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast.js'

// ストア読み込み
const postStore = usePostStore()
const userStore = useUserStore()
const { showToastMessage } = useToast()
const router = useRouter()
let intervalId

// 投稿リストは allPosts を使用。必要であれば postStore.followersPosts に差し替え可能
const posts = computed(() => postStore.followersPosts)

const showComment = reactive({})
const newComments = reactive({})

// データ取得
onMounted(async () => {
  if (userStore.id) {
    await postStore.fetchFollowersPosts()

    intervalId = setInterval(async () => {
      await postStore.fetchFollowersPosts()
    }, 1000)
  }
})

async function fetchAllUsers() {
  try {
    await userStore.fetchAllUsers()
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
  }
}

onMounted(async () => {
  if (userStore.id) {
    await postStore.fetchFollowersPosts()
    await fetchAllUsers() // ここで呼び出し
    console.log('Fetched all users:', userStore.allUsers)
    await nextTick()
  }
})

function linkifyMentions(text) {
  if (!text) return ''

  return text.replace(/(@[a-zA-Z0-9_-]+)/g, (match, username) => {
    const user = userStore.allUsers.find((u) => u.userName === username)

    if (user) {
      return `<a href="/user/${user.id}" class="mention-link">@${username}</a>`
    } else {
      return `<span class="mention-link">@${username}</span>`
    }
  })
}

// <script setup> の中の parseContent 関数
function parseContent(text) {
  if (!text) return []

  // この正規表現は、メンションを検出し、その部分をキャプチャして配列に含める
  // @の後に英数字、アンダースコア、またはハイフンが1文字以上続くパターン
  const parts = text.split(/(\s|(?=[@#]))+/).filter(Boolean) // 半角スペース or @ または # の直前で分割

  return parts.map((part) => {
    if (part.startsWith('@')) {
      const username = part.slice(1)
      const user = userStore.allUsers.find((u) => u.userName === username)
      return { text: part, isMention: true, user: user || null }
    }
    if (part.startsWith('#')) {
      const tag = part.slice(1)
      return { text: part, isHashtag: true, tag }
    }
    return { text: part, isMention: false, isHashtag: false }
  })
}

// いいねの切り替え関数
const toggleLike = async (postItem) => {
  if (!userStore.id) {
    showToastMessage('ログインしていません。いいねできません。') // 必要に応じて
    // alert('ログインしていません。いいねできません。');
    return
  }

  // オプティミスティックUIの更新 (即座にUIを更新)
  const previousLiked = postItem.liked
  const previousGood = postItem.good

  postItem.liked = !postItem.liked
  if (postItem.liked) {
    postItem.good += 1
  } else {
    postItem.good = Math.max(0, postItem.good - 1)
  }
  postItem.animateHeart = true

  try {
    const updatedPostApi = await userStore.toggleLikeApi(postItem.id)

    // APIからの応答でいいねの状態と数を正確に更新
    postItem.good = updatedPostApi.good
    // userStore.likes が更新されているので、再度それを参照して liked 状態を同期
    const isLikedAfterApi = userStore.likes.some((like) => {
      return (like.post && like.post.id === postItem.id) || like.id === postItem.id
    })
    postItem.liked = isLikedAfterApi

    console.log(
      'いいね処理成功 (TimeLine):',
      postItem.id,
      'Liked:',
      postItem.liked,
      'Good count:',
      postItem.good,
    )

    // Piniaストアの投稿リストも更新
    postStore.updatePostInStore(postItem.id, {
      good: postItem.good,
      liked: postItem.liked,
      // comments は変更されないので、ここでは含めない
    })
  } catch (error) {
    console.error('いいね処理中にエラー (TimeLine):', error)
    showToastMessage('いいね処理中にエラーが発生しました。') // 必要に応じて
    // alert("いいね処理中にエラーが発生しました。");
    // エラー時はUIを元に戻す
    postItem.liked = previousLiked
    postItem.good = previousGood
  } finally {
    postItem.animateHeart = false
  }
}

  // コメント欄トグル
  const toggleComment = (postId) => {
    showComment[postId] = !showComment[postId]
  }
  showComment[postId] = !showComment[postId];
};

// コメント送信関数
const submitComment = async (postId) => {
  if (!userStore.id) {
    showToastMessage('ログインしていません。コメントできません。') // 必要に応じて
    // alert('ログインしていません。コメントできません。');
    return
  }

  const text = (newComments[postId] || '').trim()
  if (!text) {
    showToastMessage('コメントを入力してください') // 必要に応じて
    // alert('コメントを入力してください');
    return
  }

  try {
    const response = await postStore.addComment(postId, { content: text })

    // 送信成功 → 表示中の投稿に手動で追加
    // posts.value から該当する投稿を見つける
    const targetPost = posts.value.find((p) => p.id === postId)
    if (targetPost && Array.isArray(targetPost.comments)) {
      // APIからのレスポンスを直接追加
      targetPost.comments.push(response.data)
      console.log('コメント追加成功:', response.data)

      // Piniaストアの投稿も更新する（コメント数などが変わるため）
      postStore.updatePostInStore(postId, {
        comments: targetPost.comments, // 更新されたコメント配列を渡す
      })
    }

    newComments[postId] = '' // コメントフォームクリア
    showToastMessage('コメントを送信しました！') // 必要に応じて
    // alert('コメントを送信しました！');

    // コメント送信後、フォロー中のユーザーの投稿を再フェッチしてコメントを確実に反映
    // postStore.fetchFollowersPosts(); // これを有効にするとリスト全体がリロードされる
  } catch (error) {
    console.error('コメント送信中にエラー:', error)
    showToastMessage('コメント送信中にエラーが発生しました。') // 必要に応じて
    // alert("コメント送信中にエラーが発生しました。");
  }
}

// スクロール監視のロジック (無限スクロールなどのため、もしあれば)
// onMounted(() => {
//   window.addEventListener('scroll', handleScroll);
// });

// onUnmounted(() => {
//   window.removeEventListener('scroll', handleScroll);
// });

// const handleScroll = () => {
//   // スクロールイベント処理
// };
</script>

<style scoped>
.liked {
  animation: pop 0.5s ease;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.8);
  }

  100% {
    transform: scale(1);
  }
}

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

.user-name {
  font-weight: bold;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
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
.user-name {
  font-weight: bold;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
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

.no-posts-message {
  display: flex;
  justify-content: center;
  /* 横中央 */
  align-items: center;
  /* 縦中央 */
  height: 80vh;
  /* 画面高さの60%に */
  margin: 0 auto;
  font-size: 1.5rem;
  color: #777;
  /* background: #f0f0f0; */
  border-radius: 12px;
  padding: 20px 40px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
  max-width: 400px;
  text-align: center;
  font-weight: 600;
  user-select: none;
  /* うっかりテキスト選択防止 */
}

.post-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  color: #3b82f6;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.hashtag:hover {
  text-decoration: underline;
}

/* /* .timeline {
    padding-bottom: 60px;

  } */
</style>

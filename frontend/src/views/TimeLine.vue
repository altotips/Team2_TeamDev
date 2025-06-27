<template>
  <div class="timeline">
    <div v-for="post in posts" :key="post.id" class="post-card">

      <div class="post-header">
        <img class="user-icon" :src="post.user?.urlIcon ? `http://localhost:8080/uploads/${post.user.urlIcon}` : '/images/default_profile_icon.png'" alt="User Icon" />

        <router-link :to="{ name: 'UserProfile', params: { userId: post.user?.id } }" class="user-name">
          {{ post.user?.userName }}
        </router-link>
      </div>

      <img :src="post.urlPhoto ? `http://localhost:8080/uploads/${post.urlPhoto}` : '/images/default_post_image.png'" class="post-image" :alt="post.content" />

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
          <strong>{{ comment.user?.userName }}:</strong> {{ comment.content }}
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
      ほかのユーザーをフォローして思い出をシェアしよう！！
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'; // computed は不要になるため削除
import { usePostStore } from '@/stores/postStore';
import { useUserStore } from '@/stores/userStore';

const postStore = usePostStore();
const userStore = useUserStore();

// ★ 修正点1: posts を computed から ref に変更
const posts = ref([]);

const showComment = reactive({});
const newComments = reactive({});

onMounted(async () => {
  if (userStore.id) {
    await userStore.fetchLikes(); // ログインユーザーのいいね情報を取得
    await postStore.fetchFollowersPosts(); // フォローしているユーザーの投稿を取得

    // ★ 修正点2: postStore.followersPosts の内容を直接 posts.value に代入
    //    map で新しいオブジェクトを作成せず、元のオブジェクトへの参照を維持
    posts.value = postStore.followersPosts.map(post => {
      // 既存の投稿オブジェクトを拡張して、liked と animateHeart プロパティを追加
      const newPost = { ...post }; // オブジェクトのコピーを作成し、元のストアのオブジェクトを直接変更しないようにする

      const isLikedByUser = userStore.likes.some(like => {
        if (like.post && like.post.id) {
          return like.post.id === newPost.id;
        }
        return like.id === newPost.id;
      });

      newPost.liked = isLikedByUser;
      newPost.animateHeart = false; // 初期状態は false
      return newPost;
    });
  }
});

// ★ 修正点3: userStore.likes の変更を監視し、posts.value の liked 状態を更新
watch(() => userStore.likes, (newLikes) => {
  posts.value.forEach(post => { // posts.value の各投稿をループ
    const isLiked = newLikes.some(like => {
      if (like.post && like.post.id) {
        return like.post.id === post.id;
      }
      return like.id === post.id;
    });
    // liked 状態が変わった場合にのみ更新
    if (post.liked !== isLiked) {
      post.liked = isLiked;
    }
  });
}, { deep: true });

// ★ 修正点4: postStore.followersPosts の変更を監視
//    これにより、postStore.fetchFollowersPosts が再呼び出しされた場合にも
//    posts.value が更新されるようになる
watch(() => postStore.followersPosts, (newFollowersPosts) => {
  posts.value = newFollowersPosts.map(post => {
    const newPost = { ...post };

    const isLikedByUser = userStore.likes.some(like => {
      if (like.post && like.post.id) {
        return like.post.id === newPost.id;
      }
      return like.id === newPost.id;
    });

    newPost.liked = isLikedByUser;
    newPost.animateHeart = false;
    return newPost;
  });
}, { deep: true });


const toggleLike = async (postItem) => {
  if (!userStore.id) {
    alert('ログインしていません。いいねできません。');
    return;
  }

  // オプティミスティックUIの更新 (即座にUIを更新)
  // postItem は posts.value から渡されたオブジェクトなので、直接変更すればUIに反映される
  const previousLiked = postItem.liked;
  const previousGood = postItem.good;

  // ローカルの状態を更新
  postItem.liked = !postItem.liked;
  if (postItem.liked) {
    postItem.good += 1;
  } else {
    postItem.good = Math.max(0, postItem.good - 1);
  }

  postItem.animateHeart = true; // アニメーション開始

  try {
    const updatedPost = await userStore.toggleLikeApi(postItem.id);

    // APIからの応答でいいねの状態と数を正確に更新
    // ここで `postItem.good` を `updatedPost.good` で上書きすることで、
    // ネットワーク遅延やバックエンドの実際のカウントとのずれを修正します。
    postItem.good = updatedPost.good;
    // liked の状態は userStore.likes の変更を watch しているので、
    // 明示的な再設定は不要かもしれませんが、念のため同期の最終手段として残します。
    const isLikedAfterApi = userStore.likes.some(like => {
        if (like.post && like.post.id) {
            return like.post.id === postItem.id;
        }
        return like.id === postItem.id;
    });
    postItem.liked = isLikedAfterApi;

    console.log('いいね処理成功:', postItem.id, 'Liked:', postItem.liked, 'Good count:', postItem.good);

  } catch (error) {
    console.error("いいね処理中にエラー:", error);
    alert("いいね処理中にエラーが発生しました。");
    // エラー時はUIを元に戻す
    postItem.liked = previousLiked;
    postItem.good = previousGood;
  } finally {
    postItem.animateHeart = false; // アニメーションを停止
  }
};

const toggleComment = (postId) => {
  if (typeof showComment[postId] === 'undefined') {
    showComment[postId] = false;
  }
  showComment[postId] = !showComment[postId];
};

const submitComment = async (postId) => {
  if (!userStore.id) {
    alert('ログインしていません。コメントできません。');
    return;
  }

  const text = (newComments[postId] || '').trim();
  if (!text) {
    alert('コメントを入力してください。');
    return;
  }

  try {
    const response = await postStore.addComment(postId, { content: text });

    // タイムラインの投稿リストから対象の投稿を見つける
    const targetPost = posts.value.find(p => p.id === postId); // ★ posts.value を使う

    if (targetPost && response && response.data) {
      const newCommentFromServer = response.data;
      
      if (!targetPost.comments) {
        targetPost.comments = [];
      }
      targetPost.comments.push(newCommentFromServer);
    }

    newComments[postId] = '';
  } catch (error) {
    console.error("コメント送信中にエラー:", error);
    alert("コメント送信中にエラーが発生しました。");
  }
};
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

  /* /* .timeline {
    padding-bottom: 60px;

  } */
</style>
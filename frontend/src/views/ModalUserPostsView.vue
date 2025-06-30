<template>
  <teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-button" @click="closeModal">&times;</button>

          <div v-if="!post" class="loading-message">
            <p>投稿データを読み込み中...またはデータがありません。</p>
          </div>
          <div v-else class="modal-post-display">
            <div class="post-header">
              <img class="user-icon"
                :src="post.user?.urlIcon ? `http://localhost:8080/uploads/${post.user.urlIcon}` : '/images/default_profile_icon.png'"
                alt="User Icon" />
              <span class="user-name">{{ post.user?.userName }}</span>
            </div>

            <img class="post-image"
              :src="post.urlPhoto ? `http://localhost:8080/uploads/${post.urlPhoto}` : '/images/default_post_image.png'"
              :alt="post.content" />

            <div class="post-actions">
              <button @click="toggleLike()" class="icon-button"
                :class="{ liked: post.liked, animate: post.animateHeart }">
                <span :style="{ color: post.liked ? 'red' : '#aaa' }">
                  {{ post.liked ? '❤️' : '♡' }}
                </span>
              </button>
              <p>{{ post.good }} </p>
              <button @click="toggleComment()" class="icon-button">
                💬
              </button>

              <p v-if="Array.isArray(post.comments)">
                {{ post.comments.length }}
              </p>

            </div>

            <p class="post-content">{{ post.content }}</p>

            <div v-if="post && post.id && showComment[post.id]" class="comment-section">
              <div v-for="comment in post.comments" :key="comment.id" class="comment">
                <strong>{{ comment.user?.userName }}:</strong> {{ comment.content }}
              </div>
              <form @submit.prevent="submitComment()" class="comment-form">
                <input v-model="newComments[post.id]" type="text" placeholder="コメント..." />
                <button type="submit">送信</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { usePostStore } from '@/stores/postStore.js';
import { useUserStore } from '@/stores/userStore.js';
// useToast がコメントアウトされているが、showToastMessage が使われているので、必要であればコメントアウトを外す
// import { useToast } from '@/composables/useToast.js'; 

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  postData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'update:post']);

const postStore = usePostStore();
const userStore = useUserStore();
// const { showToastMessage } = useToast(); // showToastMessage を使う場合はこれが必要

const isOpen = ref(props.show);
const post = ref(null);

const showComment = reactive({});
const newComments = reactive({});

watch(() => [props.show, props.postData], async ([newShowVal, newPostDataVal]) => {
  isOpen.value = newShowVal;
  if (newShowVal && newPostDataVal) {
    const clonedPost = JSON.parse(JSON.stringify(newPostDataVal));

    if (userStore.id) {
      await userStore.fetchLikes();
    }
    
    if (userStore.likes && Array.isArray(userStore.likes)) {
      clonedPost.liked = userStore.likes.some(like => {
        if (like.post && like.post.id) {
          return like.post.id === clonedPost.id;
        }
        return like.id === clonedPost.id;
      });
    } else {
      clonedPost.liked = false;
    }
    clonedPost.animateHeart = false;

    post.value = clonedPost;

    if (post.value && post.value.id) { // post.value が null でないことを確認
      showComment[post.value.id] = false;
      newComments[post.value.id] = '';
    }

    document.body.style.overflow = 'hidden';
  } else {
    post.value = null;
    document.body.style.overflow = '';
  }
}, { immediate: true, deep: true });

const closeModal = () => {
  isOpen.value = false;
  emit('close');
  document.body.style.overflow = '';
};

const toggleLike = async () => {
  if (!userStore.id || !post.value || !post.value.id) { // post.value.id のチェックを追加
    // showToastMessage('ログインしていません、または投稿データがありません。いいねできません。'); // useToast が必要
    alert('ログインしていません、または投稿データがありません。いいねできません。');
    return;
  }

  const currentPost = post.value;

  const previousLiked = currentPost.liked;
  const previousGood = currentPost.good;

  currentPost.liked = !currentPost.liked;
  if (currentPost.liked) {
    currentPost.good += 1;
  } else {
    currentPost.good = Math.max(0, currentPost.good - 1);
  }

  currentPost.animateHeart = true;

  try {
    const updatedPostApi = await userStore.toggleLikeApi(currentPost.id);
    
    currentPost.liked = userStore.likes.some(like => {
      if (like.post && like.post.id) {
        return like.post.id === currentPost.id;
      }
      return like.id === currentPost.id;
    });
    currentPost.good = updatedPostApi.good; // APIから返された正確ないいね数を使用

    console.log('いいね処理成功:', currentPost.id, 'Liked:', currentPost.liked, 'Good count:', currentPost.good);

    emit('update:post', currentPost);

  } catch (error) {
    console.error("いいね処理中にエラー:", error);
    // showToastMessage("いいね処理中にエラーが発生しました。"); // useToast が必要
    alert("いいね処理中にエラーが発生しました。");
    currentPost.liked = previousLiked;
    currentPost.good = previousGood;
  } finally {
    currentPost.animateHeart = false;
  }
};

const toggleComment = () => {
  if (post.value && post.value.id) { // post.value と id のチェック
    showComment[post.value.id] = !showComment[post.value.id];
  }
};

// コメント送信関数
const submitComment = async () => { // ★ ここから引数 (postId) を削除します
  if (!userStore.id) {
    // showToastMessage('ログインしていません。コメントできません。'); // useToast が必要
    alert('ログインしていません。コメントできません。');
    return;
  }

  // 投稿データが有効であることを確認
  if (!post.value || !post.value.id) {
    // showToastMessage('投稿データが見つかりません。'); // useToast が必要
    alert('投稿データが見つかりません。');
    return;
  }

  // コメント内容を適切な postId から取得
  const text = (newComments[post.value.id] || '').trim(); // ★ post.value.id を使用
  if (!text) {
    // showToastMessage('コメントを入力してください'); // useToast が必要
    alert('コメントを入力してください');
    return;
  }

  try {
    // postStore.addComment を呼び出す際に、post.value.id を渡す
    const response = await postStore.addComment(post.value.id, { content: text }); // ★ post.value.id を使用

    if (response && response.data) {
      // コメントが追加されたら、現在のpostオブジェクトのcomments配列を更新
      // post.value.comments が配列であることを確認
      if (!Array.isArray(post.value.comments)) {
        post.value.comments = []; // 配列でない場合は初期化
      }
      // 新しいコメントを配列の最後に追加（必要に応じて unshift で先頭に追加も可）
      post.value.comments.push(response.data);

      // コメント入力フィールドをクリア
      newComments[post.value.id] = '';
      // showToastMessage('コメントを送信しました！'); // useToast が必要

      // ★ 親コンポーネントに更新された投稿データを通知
      // post.value はすでに更新されているので、そのまま渡す
      emit('update:post', post.value);

    } else {
      // showToastMessage('コメントの投稿に失敗しました。'); // useToast が必要
      alert('コメントの投稿に失敗しました。');
    }
  } catch (error) {
    console.error("コメント送信中にエラー:", error);
    // showToastMessage("コメント送信中にエラーが発生しました。"); // useToast が必要
    alert("コメント送信中にエラーが発生しました。");
  }
};
</script>


<style scoped>
  /* ModalUserPostsView用のスタイル */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    max-width: 600px;
    /* タイムラインの投稿カードに近い幅 */
    width: 90%;
    max-height: 90%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
    z-index: 10;
  }

  .loading-message,
  .error-message {
    padding: 50px;
    text-align: center;
    color: #888;
  }

  /* --- Timeline.vueのpost-card関連スタイルをここに適用 --- */
  .modal-post-display {
    /* post-cardのスタイルに合わせる */
    width: 100%;
    /* モーダルコンテンツ内で幅いっぱいに表示 */
    /* paddingやmarginは個別の要素で調整 */
  }

  .post-header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
  }

  .user-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
  }

  .user-name {
    font-weight: bold;
    color: #262626;
    text-decoration: none;
  }

  .post-image {
    width: 100%;
    height: auto;
    display: block;
    /* モーダル内の画像なのでクリックイベントは不要 */
  }

  .post-actions {
    display: flex;
    padding: 10px 15px;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .icon-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0 8px;
    color: #8e8e8e;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .icon-button span {
    font-size: 20px;
  }

  .post-content {
    padding: 10px 15px;
    font-size: 15px;
    color: #333;
    line-height: 1.5;
    white-space: pre-wrap;
    /* 改行を保持 */
  }

  .comment-section {
    padding: 10px 15px;
    border-top: 1px solid #eee;
  }

  .comment {
    font-size: 14px;
    margin-bottom: 5px;
  }

  .comment strong {
    margin-right: 5px;
  }

  .comment-form {
    display: flex;
    margin-top: 10px;
  }

  .comment-form input {
    flex-grow: 1;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 8px;
    margin-right: 10px;
  }

  .comment-form button {
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 15px;
    cursor: pointer;
    font-weight: bold;
  }

  /* モーダル表示・非表示のアニメーション */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-fade-enter-active .modal-content,
  .modal-fade-leave-active .modal-content {
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  .modal-fade-enter-from .modal-content,
  .modal-fade-leave-to .modal-content {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }

  /* モーダルのサイズをレスポンシブに調整 */
  @media (max-width: 767px) {
    .modal-content {
      max-width: 95%;
      width: 95%;
    }

    .post-header {
      margin-bottom: 10px;
    }

    .user-icon {
      width: 30px;
      height: 30px;
    }

    .user-name {
      font-size: 14px;
    }

    .post-image {
      margin-bottom: 10px;
    }

    .post-content {
      font-size: 14px;
    }
  }
</style>
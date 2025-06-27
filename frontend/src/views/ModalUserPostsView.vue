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

            <div v-if="showComment[post.id]" class="comment-section">
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
import { usePostStore } from '@/stores/postStore.js'; // postStore はコメント機能で引き続き使用
import { useUserStore } from '@/stores/userStore.js';

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

const emit = defineEmits(['close', 'update:post']); // 'update:post' イベントを追加

const postStore = usePostStore();
const userStore = useUserStore();

const isOpen = ref(props.show);
const post = ref(null); // 投稿データを保持するref

const showComment = reactive({});
const newComments = reactive({});

// props.show と props.postData の変更を監視
watch(() => [props.show, props.postData], async ([newShowVal, newPostDataVal]) => {
  isOpen.value = newShowVal;
  if (newShowVal && newPostDataVal) {
    // 渡された投稿データをディープコピー
    // これにより、モーダル内でpostオブジェクトを直接変更しても、
    // 親コンポーネントの元のpostDataが影響を受けない
    const clonedPost = JSON.parse(JSON.stringify(newPostDataVal));

    // userStoreのいいね情報を取得（念のため、最新の状態を確保）
    // userStore.likesが既に最新であれば、このawaitは速やかに解決されます
    if (userStore.id) { // ユーザーがログインしている場合のみ
      await userStore.fetchLikes();
    }
    
    // いいね状態をuserStoreから初期化
    if (userStore.likes && Array.isArray(userStore.likes)) {
      clonedPost.liked = userStore.likes.some(like => {
        // userStore.likes の要素が Likes エンティティ全体の場合 (例: {id: 1, post: {id: 10, ...}, user: {...}} )
        if (like.post && like.post.id) {
          return like.post.id === clonedPost.id;
        }
        // userStore.likes の要素が単純な liked Post ID の場合 (例: {id: 10} )
        return like.id === clonedPost.id;
      });
    } else {
      clonedPost.liked = false;
    }
    clonedPost.animateHeart = false; // アニメーションの状態を初期化

    post.value = clonedPost; // refに代入

    // コメントセクションと入力フィールドの初期化
    showComment[post.value.id] = false;
    newComments[post.value.id] = '';


    document.body.style.overflow = 'hidden'; // スクロール禁止
  } else {
    post.value = null; // モーダルが閉じる際に投稿データをクリア
    document.body.style.overflow = ''; // スクロールを許可
  }
}, { immediate: true, deep: true }); // deep: true を追加して postData 内部の変更も監視

const closeModal = () => {
  isOpen.value = false;
  emit('close');
  document.body.style.overflow = '';
};

const toggleLike = async () => {
  if (!userStore.id || !post.value) {
    alert('ログインしていません、または投稿データがありません。いいねできません。');
    return;
  }

  const currentPost = post.value;


  // オプティミスティックUI更新のための事前状態保存
  const previousLiked = currentPost.liked;
  const previousGood = currentPost.good;

  // UIを即座に更新
  currentPost.liked = !currentPost.liked;
  if (currentPost.liked) {
    currentPost.good += 1;
  } else {
    currentPost.good = Math.max(0, currentPost.good - 1);
  }

  currentPost.animateHeart = true; // アニメーション開始

  try {
    // ★ 修正点: userStoreのtoggleLikeApiを呼び出す
    const updatedPost = await userStore.toggleLikeApi(currentPost.id);
    
    // APIからの応答でいいねの状態と数を正確に更新
    // userStore.likes は toggleLikeApi 内で更新されるため、
    // ここで再度 likes.some を使うことで、状態を同期させます
    currentPost.liked = userStore.likes.some(like => {
      // userStore.likes の要素の構造に合わせて調整
      if (like.post && like.post.id) { // Likesエンティティ全体の場合
        return like.post.id === currentPost.id;
      }
      return like.id === currentPost.id; // シンプルなID配列の場合
    });
    currentPost.good = updatedPost.good; // APIから返された正確ないいね数を使用

    console.log('いいね処理成功:', currentPost.id, 'Liked:', currentPost.liked, 'Good count:', currentPost.good);

    // ★ 修正点: 親コンポーネントに更新された投稿データを通知
    // post.value は `currentPost` と同じオブジェクトであり、ディープコピーされている
    // 親コンポーネントはこのイベントを受けて、自身のpostsリスト内の該当する投稿を更新できる
    emit('update:post', currentPost);

  } catch (error) {
    console.error("いいね処理中にエラー:", error);
    alert("いいね処理中にエラーが発生しました。");
    // エラー時はUIを元に戻す
    currentPost.liked = previousLiked;
    currentPost.good = previousGood;
  } finally {
    currentPost.animateHeart = false; // アニメーションフラグをリセット
  }
};

const toggleComment = () => {
  if (post.value) {
    // 既に開いている場合は閉じる、閉じている場合は開く
    showComment[post.value.id] = !showComment[post.value.id];
  }
};
  // コメント送信
  const submitComment = async (postId) => {
    if (!userStore.id) {
      showToastMessage('ログインしていません。コメントできません。');
      // alert('ログインしていません。コメントできません。');
      return;
    }

    const text = (newComments[postId] || '').trim()
    if (!text){
      return showToastMessage('コメントを入力してください')
      // return alert('コメントを入力してください')
    }

  const postId = post.value.id;
 

  try {
    // postStore.addComment はバックエンドからCommentオブジェクトを返すことを想定
    const response = await postStore.addComment(postId, { content: text });

      newComments[postId] = '' // コメントフォームクリア
      showToastMessage('コメントを送信しました！');
      // alert('コメントを送信しました！');
      await postStore.fetchAllPosts(); // コメント送信後、最新のコメントリストを反映するために再フェッチ
    } catch (error) {
      console.error("コメント送信中にエラー:", error);
      showToastMessage("コメント送信中にエラーが発生しました。");
      // alert("コメント送信中にエラーが発生しました。");
    }
    
    // コメント入力フィールドをクリア
    newComments[postId] = '';
    
    // alert('コメントを送信しました！'); // アラートは頻繁だとUXを損ねるためコメントアウト
    // ★ 修正点: コメント送信後、投稿データを更新したことを親に通知
    emit('update:post', post.value);

  } 
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
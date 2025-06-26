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

            <!-- <div class="post-actions">
              <button @click="toggleLike(post)" class="icon-button">
                <span :style="{ color: post.liked ? 'red' : '#aaa' }">
                  {{ post.liked ? '❤️' : '♡' }}
                </span>
              </button>
              <button @click="toggleComment(post.id)" class="icon-button">
                💬 コメント
              </button>
            </div> -->
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
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
  import { ref, watch, reactive } from 'vue'; // reactive をインポート
  import { usePostStore } from '@/stores/postStore.js';
  import { useUserStore } from '@/stores/userStore.js'; // useUserStore をインポート

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    postData: {
      type: Object, // 投稿オブジェクトを想定
      default: null
    }
  });

  const emit = defineEmits(['close']);

  // ストアを読み込む
  const postStore = usePostStore();
  const userStore = useUserStore();

  const isOpen = ref(props.show);
  const post = ref(props.postData); // 受け取ったpostDataをrefに設定
  const isLoading = ref(false); // このコンポーネントでは直接APIを叩かないので基本false

  // コメント表示状態と新しいコメント入力用のreactiveオブジェクト
  const showComment = reactive({});
  const newComments = reactive({});


  // props.show と props.postData の変更を監視
  watch(() => [props.show, props.postData], ([newShowVal, newPostDataVal]) => {
    isOpen.value = newShowVal;
    if (newShowVal && newPostDataVal) {
      // 渡された投稿データをディープコピーして扱う (Piniaストアのオブジェクトへの直接変更を避けるため)
      // ただし、リアクティブ性を保つためrefでラップし、必要に応じてリアクティブに変換
      post.value = JSON.parse(JSON.stringify(newPostDataVal));
      // いいね状態の同期 (UserProfileView側で変更があった場合)
      // または、モーダル内でいいね状態が変更された場合に、親のuserPostsに反映させるロジックも必要になる可能性あり

      // コメントセクションの初期状態をリセット
      showComment[post.value.id] = false;
      newComments[post.value.id] = '';

      document.body.style.overflow = 'hidden';
    } else {
      post.value = null; // モーダルが閉じたらデータをクリア
      document.body.style.overflow = '';
    }
  }, { immediate: true });

  const closeModal = () => {
    isOpen.value = false;
    emit('close');
    document.body.style.overflow = '';
  };


  // いいね処理（API呼び出し付き）
  const toggleLike = async (post) => {
    if (!userStore.id) {
      showToastMessage('ログインしていません。いいねできません。');
      // alert('ログインしていません。いいねできません。');
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
      showToastMessage("いいね処理中にエラーが発生しました。");
      // alert("いいね処理中にエラーが発生しました。");
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
      showToastMessage('ログインしていません。コメントできません。');
      // alert('ログインしていません。コメントできません。');
      return;
    }

    const text = (newComments[postId] || '').trim()
    if (!text){
      return showToastMessage('コメントを入力してください')
      // return alert('コメントを入力してください')
    }

    try {
      await postStore.addComment(postId, {
        user: await userStore.getUser(userStore.id), // コメント送信時もgetUserを使用
        content: text,
      });

      newComments[postId] = '' // コメントフォームクリア
      showToastMessage('コメントを送信しました！');
      // alert('コメントを送信しました！');
      await postStore.fetchAllPosts(); // コメント送信後、最新のコメントリストを反映するために再フェッチ
    } catch (error) {
      console.error("コメント送信中にエラー:", error);
      showToastMessage("コメント送信中にエラーが発生しました。");
      // alert("コメント送信中にエラーが発生しました。");
    }
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
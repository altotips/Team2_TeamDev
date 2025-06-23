<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">&times;</button>

      <div v-if="post && !isLoading" class="modal-post-display">
        <div class="post-header">
          <img class="user-icon" :src="post.user.urlIcon || '/images/default_profile_icon.png'" alt="User Icon" />
          <span class="user-name">{{ post.user.userName }}</span>
        </div>

        <img class="post-image" :src="post.urlPhoto || '/images/default_post_image.png'" :alt="post.content" />

        <p class="post-content">{{ post.content }}</p>
      </div>
      <div v-else class="loading-message">
        <p>投稿データを読み込み中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePostStore } from '@/stores/postStore.js'; // postStoreをインポート
import { useUserStore } from '@/stores/userStore.js'; // userStoreをインポート（ユーザー情報が必要な場合）

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  postId: { // 表示する投稿のID
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close']); // 親にモーダルを閉じるイベントを通知

const postStore = usePostStore(); // postStoreのインスタンスを作成
// const userStore = useUserStore(); // userStoreが必要な場合はコメントアウトを解除

const isOpen = ref(props.show);
const post = ref(null); // 選択された投稿データ
const isLoading = ref(false); // 読み込み状態

// props.show の変更を監視して、モーダルの表示状態を更新
watch(() => props.show, (newVal) => {
  isOpen.value = newVal;
  if (newVal && props.postId) {
    fetchPostDetails(props.postId); // モーダルが開いたら投稿詳細をフェッチ
  } else {
    post.value = null; // モーダルが閉じたらデータをクリア
  }
});

const fetchPostDetails = async (id) => {
  isLoading.value = true; // 読み込み開始
  try {
    // postStoreから指定されたIDの投稿データを取得
    // postStoreのgetPostByIdはAPIを叩いてデータを取得すると想定
    const fetchedPost = await postStore.getPostById(id);

    if (fetchedPost) {
      // APIから取得した投稿データにはユーザー情報も含まれていると想定
      // 例: fetchedPost.user.userName, fetchedPost.user.urlIcon
      post.value = fetchedPost;
    } else {
      console.warn(`投稿ID ${id} の詳細データが見つかりません。`);
      post.value = null;
    }
  } catch (error) {
    console.error('投稿詳細の取得中にエラー:', error);
    post.value = null;
  } finally {
    isLoading.value = false; // 読み込み終了
  }
};

const closeModal = () => {
  isOpen.value = false;
  emit('close'); // 親コンポーネントに閉じるイベントを通知
};
</script>

<style scoped>
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
  z-index: 1000; /* 他の要素より手前に表示 */
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  max-width: 90%; /* モーダルの最大幅 */
  max-height: 90%; /* モーダルの最大高さ */
  overflow-y: auto; /* コンテンツがはみ出したらスクロール */
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
  z-index: 10; /* 他のコンテンツより手前に表示 */
}

.loading-message {
  padding: 50px;
  text-align: center;
  color: #888;
}

/* 投稿表示部分のスタイル（提供されたコードから調整） */
.modal-post-display {
  padding: 20px; /* モーダルコンテンツ内のパディング */
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.user-name {
  font-weight: bold;
  font-size: 14px;
}

.post-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin-bottom: 15px; /* 画像とコンテンツの間に余白 */
  border-radius: 4px; /* 角を少し丸める */
}

.post-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-wrap: break-word; /* 長い単語がはみ出さないように */
  white-space: pre-wrap; /* 改行を反映 */
}

/* モーダルのサイズをレスポンシブに調整 */
@media (min-width: 768px) {
  .modal-content {
    max-width: 600px; /* PCでのモーダルの最大幅 */
  }
}
</style>
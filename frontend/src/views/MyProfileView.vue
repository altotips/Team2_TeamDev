<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <h1 class="username">{{ userStore.userName }}</h1>
      </div>

      <div class="profile-details-row">
        <div class="icon-container">
          <img :src="userStore.urlIcon ? `http://localhost:8080/uploads/${userStore.urlIcon}` : defaultIcon" alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ userStore.fullName }}</div>
            <div class="my-profile-buttons">
              <button class="edit-profile-button" @click="editProfile">プロフィール編集</button>
              <button class="logout-button" @click="logout">ログアウト</button>
            </div>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ postsCount }}</span>
              <span class="stat-label">投稿</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ followingCount }}</span>
              <router-link :to="`/followlist?userId=${userStore.id}&type=following`" class="stat-label-link">
                <span class="stat-label">フォロー中</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="self-introduction">{{ userStore.selfIntroduction }}</div>
    </header>

    <main class="profile-content">
      <div class="posts-grid">
        <div v-for="post in userPosts" :key="post.id" class="post-thumbnail" @click="openModal(post)">
          <img :src="post.urlPhoto ? `http://localhost:8080/uploads/${post.urlPhoto}` : '/images/default_post_image.png'" :alt="post.content" class="post-image" loading="lazy">
          <div class="post-overlay">
            <div class="overlay-stats">
              <span class="stat-icon">❤️</span>
              <span class="stat-number">{{ post.goodCount }}</span>
              <span class="stat-icon">💬</span>
              <span class="stat-number">{{ post.commentCount }}</span>
            </div>
          </div>
        </div>

        <div v-if="userPosts.length === 0 && !isLoading" class="no-posts-message">
          まだ投稿がありません。
        </div>

        <div v-if="isLoading" class="loading-message">
          読み込み中...
        </div>
      </div>
    </main>
  </div>

  <ModalUserPostsView :show="showModal" :postData="selectedPostObj" @close="closeModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { usePostStore } from '@/stores/postStore';
import defaultIcon from '@/images/default_icon.png';
// モーダルコンポーネントをインポート
import ModalUserPostsView from '@/views/ModalUserPostsView.vue';

const router = useRouter();
const userStore = useUserStore();
const postStore = usePostStore();

// モーダルの表示状態と選択された投稿データを管理するrefを追加
const showModal = ref(false);
const selectedPostObj = ref(null);

// displayIconUrl は userStore.urlIcon を直接使用するため、不要
// const displayIconUrl = computed(() => {
//   return userStore.urlIcon;
// });

const postsCount = ref(0); // 初期値を0に設定
const followingCount = ref(0); // 初期値を0に設定
const userPosts = ref([]); // 初期値を空の配列に設定

const isLoading = ref(false);

const editProfile = () => {
  router.push('/ProfileEdit'); // プロフィール編集画面へ遷移
};

const logout = async () => {
  console.log('ログアウト処理を実行します');

  const success = await userStore.logout();
  if (success) {
    router.push('/'); // ログイン画面に遷移
  } else {
    alert('ログアウトに失敗しました');
  }
};

onMounted(
  async () => {
    isLoading.value = true; // 読み込み開始
    try {
      // ログイン中のユーザーの情報を取得
      if (userStore.id) { // userStore.id が存在することを確認
        await userStore.getUser(userStore.id);
        // userStore.followers() を呼び出して、ログインユーザーがフォローしているリストを更新
        // followers() は userStore.follows を更新する想定
        await userStore.followers(); 
      } else {
        // ログインしていない場合のエラーハンドリング
        console.warn("ユーザーがログインしていません。プロフィール情報をロードできません。");
        // ユーザーをログインページにリダイレクトするなどの処理
        router.push('/login'); 
        isLoading.value = false;
        return;
      }
      
      console.log(userStore.id); // デバッグ用
      await postStore.fetchMyPosts(userStore.id);
      console.log(postStore.myPosts); // デバッグ用
      userPosts.value = postStore.myPosts;
      postsCount.value = postStore.myPosts.length;
      
      // userStore.follows は userStore.followers() によって更新されるため、
      // ここで直接参照して問題ありません
      followingCount.value = userStore.follows ? userStore.follows.length : 0;

    } catch (error) {
      console.error("プロフィールデータの読み込み中にエラーが発生しました:", error);
      // ユーザーへの通知や、特定のエラー処理を追加
    } finally {
      isLoading.value = false; // 読み込み終了
    }
  }
);

// モーダルを開く関数
const openModal = (post) => {
  selectedPostObj.value = post; // クリックされた投稿データをセット
  showModal.value = true; // モーダルを表示
};

// モーダルを閉じる関数
const closeModal = () => {
  showModal.value = false; // モーダルを非表示
  selectedPostObj.value = null; // 選択された投稿データをクリア
};
</script>

<style scoped>
/* スタイルは以前の提案と同じで変更なし */
.profile-page {
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  box-sizing: border-box;
}

.profile-header {
  margin-bottom: 44px;
}

/* ユーザーネームのトップエリア */
.header-top {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左寄せ */
  margin-bottom: 20px; /* アイコン行との間隔 */
}

.username {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* アイコンと右側情報の横並びコンテナ */
.profile-details-row {
  display: flex;
  align-items: flex-start; /* アイコンと右側の情報の高さを上揃え */
  margin-bottom: 20px; /* 自己紹介との間隔 */
  gap: 80px; /* アイコンと右側情報の間隔 */
}

.icon-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* アイコン右側の情報すべてをまとめるコンテナ */
.right-of-icon-info {
  flex-grow: 1; /* 残りのスペースを埋める */
  display: flex;
  flex-direction: column; /* フルネーム、ボタン、統計情報を縦に並べる */
  justify-content: center; /* 垂直方向の中央寄せ（アイコンとのバランスのため） */
  min-height: 150px; /* アイコンの高さに合わせる */
}

/* フルネームとフォローボタンの横並びコンテナ */
.name-and-button {
  display: flex;
  align-items: center; /* 垂直中央揃え */
  margin-bottom: 30px; /* 統計情報との間隔を広げた */
  gap: 30px; /* フルネームとボタンの間隔を広げた */
}

.full-name {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}

.follow-button { /* このボタンは今回は使われていませんが、既存CSSを残します */
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.follow-button.is-following { /* このクラスは今回は使われていませんが、既存CSSを残します */
  background-color: #efefef;
  color: #262626;
  border: 1px solid #dbdbdb;
}

.user-stats {
  display: flex;
  justify-content: flex-start; /* 左寄せ */
  gap: 60px; /* 統計項目間の間隔を広げた */
  font-size: 16px;
  text-align: left;
  margin-bottom: 20px; /* 自己紹介との間隔 */
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 5px;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
}

.stat-label {
  color: #8e8e8e;
  font-size: 14px;
}

.stat-label-link {
  color: #8e8e8e;
  font-size: 14px;
  text-decoration: none;
}

.stat-label-link:hover {
  text-decoration: underline;
}

.self-introduction {
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  margin-bottom: 20px; /* 投稿グリッドとの間隔 */
}

.profile-content {
  border-top: 1px solid #dbdbdb;
  padding-top: 20px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.post-thumbnail {
  width: 100%;
  padding-top: 100%; /* 1:1のアスペクト比を維持 */
  position: relative;
  overflow: hidden;
  background-color: #eee;
  cursor: pointer; /* ホバーでクリック可能であることを示す */
}

.post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease; /* ホバー時のアニメーション */
}

/* --- オーバーレイ表示のための追加CSS --- */
.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* 半透明の黒で画像を暗くする */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0; /* 初期状態では非表示 */
  transition: opacity 0.3s ease; /* フェードイン/アウトのアニメーション */
  /* pointer-events: none; は不要。クリックイベントが.post-thumbnailで捕捉されるため */
}

.post-thumbnail:hover .post-overlay {
  opacity: 1; /* ホバー時に表示 */
}

.post-thumbnail:hover .post-image {
  transform: scale(1.05); /* ホバー時に画像を少し拡大（任意） */
}

.overlay-stats {
  display: flex;
  color: white;
  font-size: 18px;
  font-weight: bold;
  gap: 20px; /* アイテム間のスペース */
}

.overlay-stats .stat-icon {
  margin-right: 5px; /* アイコンと数字の間のスペース */
}

.overlay-stats .stat-number {
  /* ここは特に調整不要ですが、必要なら追加 */
}
/* --- 追加CSSここまで --- */


.no-posts-message, .loading-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #8e8e8e;
  font-size: 18px;
}
.my-profile-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.edit-profile-button,
.logout-button {
  background-color: #fff;
  color: #262626;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.edit-profile-button:hover,
.logout-button:hover {
  background-color: #fafafa;
}


/* レスポンシブ対応 */
@media (max-width: 768px) {
  .profile-details-row {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .icon-container {
    width: 100px;
    height: 100px;
  }
  .right-of-icon-info {
    align-items: center;
    min-height: auto;
  }
  .name-and-button {
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }
  .user-stats {
    justify-content: space-around;
    width: 100%;
    gap: 40px;
  }
  .posts-grid {
    gap: 10px;
  }

  /* モバイルではオーバーレイを非表示にする例。必要に応じて調整してください */
  .post-overlay {
    display: none;
  }
}
</style>
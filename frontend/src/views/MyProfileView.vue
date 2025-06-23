<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <h1 class="username">{{ userStore.userName }}</h1>
      </div>

      <div class="profile-details-row">
        <div class="icon-container">
          <img :src="displayIconUrl" alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ userStore.fullName }}</div>
            <!-- 編集ボタンとログアウトボタン -->
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
              <span class="stat-label">フォロー中</span>
            </div>
          </div>
        </div>
      </div>

      <div class="self-introduction">{{ userStore.selfIntroduction }}</div>
    </header>

    <main class="profile-content">
      <div class="posts-grid">
        <div v-for="post in userPosts" :key="post.id" class="post-thumbnail">
          <img :src="post.urlPhoto || '/images/default_post_image.png'" :alt="post.content" class="post-image" loading="lazy">
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
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import defaultIcon from '@/images/default_icon.png';

const userName = ref('my_username');
const userIconUrl = ref(null); // ユーザーがアップロードしていない場合 null
const fullName = ref('自分のユーザー名');
const selfIntroduction = ref('これは自分のプロフィールの自己紹介文です。');
const postsCount = ref(123);
const followingCount = ref(45);

const userPosts = ref([
  { id: 1, urlPhoto: 'https://picsum.photos/seed/landscape/300', content: '風景写真' },
  { id: 2, urlPhoto: 'https://picsum.photos/seed/food/300', content: '食べ物の写真' },
  { id: 3, urlPhoto: 'https://picsum.photos/seed/pet/300', content: 'ペットの写真' },
  { id: 4, urlPhoto: 'https://picsum.photos/seed/selfie/300', content: '自撮り' },
  { id: 5, urlPhoto: 'https://picsum.photos/seed/art/300', content: 'アート作品' },
  { id: 6, urlPhoto: 'https://picsum.photos/seed/daily/300', content: '日常' },
]);

const isLoading = ref(false);

const displayIconUrl = ref(userIconUrl.value || defaultIcon);

const editProfile = () => {
  console.log('プロフィール編集ボタンが押されました');
  // 例：router.push('/edit-profile');
};

const logout = () => {
  console.log('ログアウト処理を実行します');
  // 例：ログアウト処理 + router.push('/login');
};

const userStore = useUserStore();
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
  /* ここを修正: margin-bottom を増やす */
  margin-bottom: 30px; /* 統計情報との間隔を広げた */
  /* ここを修正: gap を増やす */
  gap: 30px; /* フルネームとボタンの間隔を広げた */
}

.full-name {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}

.follow-button {
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

.follow-button.is-following {
  background-color: #efefef;
  color: #262626;
  border: 1px solid #dbdbdb;
}

.user-stats {
  display: flex;
  justify-content: flex-start; /* 左寄せ */
  /* ここを修正: gap を増やす */
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
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  background-color: #eee;
}

.post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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
    /* レスポンシブでも少し間隔を広げる */
    gap: 20px;
    margin-bottom: 20px; /* レスポンシブでの間隔も調整 */
  }
  .user-stats {
    justify-content: space-around;
    width: 100%;
    /* レスポンシブでも少し間隔を広げる */
    gap: 40px;
  }
  .posts-grid {
    gap: 10px;
  }
}
</style>
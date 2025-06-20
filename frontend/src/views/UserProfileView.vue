<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <h1 class="username">{{ userName }}</h1>
        <button v-if="!isMyProfile" :class="['follow-button', { 'is-following': isFollowing }]" @click="toggleFollow">
          {{ isFollowing ? 'フォロー中' : 'フォロー' }}
        </button>
      </div>

      <div class="header-middle">
        <div class="icon-container">
          <img :src="userIconUrl || '/images/default_profile_icon.png'" alt="User Icon" class="profile-icon">
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

      <div class="full-name">{{ fullName }}</div>
      <div class="self-introduction">{{ selfIntroduction }}</div>
    </header>

    <main class="profile-content">
      <div class="posts-grid">
        <div v-for="post in userPosts" :key="post.id" class="post-thumbnail">
          <img :src="post.urlPhoto || '/images/default_post_image.png'" :alt="post.content" class="post-image">
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

// ダミーデータで全てのリアクティブ変数を初期化
const userName = ref('dummy_username');
// ↓↓↓ ここを修正 ↓↓↓
const userIconUrl = ref('/images/dummy_icon.png'); // public/images/dummy_icon.png を指す
// ↑↑↑ ここを修正 ↑↑↑
const fullName = ref('ダミー ユーザー名');
const selfIntroduction = ref('これは自己紹介のダミーテキストです。このユーザーの興味や活動について記述されます。');
const postsCount = ref(123);
const followingCount = ref(45);
const isMyProfile = ref(false);
const isFollowing = ref(false);

// ダミーの投稿データ
const userPosts = ref([
  // ↓↓↓ ここを修正 ↓↓↓
  { id: 1, urlPhoto: '/images/dummy_post1.png', content: '風景写真' }, // public/images/dummy_post1.png を指す
  { id: 2, urlPhoto: '/images/dummy_post2.png', content: '食べ物の写真' }, // public/images/dummy_post2.png を指す
  { id: 3, urlPhoto: '/images/dummy_post3.png', content: 'ペットの写真' },
  { id: 4, urlPhoto: '/images/dummy_post4.png', content: '自撮り' },
  { id: 5, urlPhoto: '/images/dummy_post5.png', content: 'アート作品' },
  { id: 6, urlPhoto: '/images/dummy_post6.png', content: '日常' },
  // ↑↑↑ ここを修正 ↑↑↑
]);

const isLoading = ref(false);
const error = ref(null);

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
  console.log('フォロー状態を切り替えました:', isFollowing.value);
};
</script>
<style scoped>
/* スタイルは以前の提案と同じで変更なし */
.profile-page {
  max-width: 935px; /* インスタグラムの一般的な最大幅 */
  margin: 0 auto;
  padding: 30px 20px;
  box-sizing: border-box;
}

.profile-header {
  margin-bottom: 44px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左寄せ */
  margin-bottom: 20px;
  gap: 20px; /* ユーザーネームとボタンの間隔 */
}

.username {
  font-size: 28px; /* ユーザーネームのサイズ */
  font-weight: 300; /* インスタグラム風のフォントウェイト */
  margin: 0;
  white-space: nowrap; /* 折り返しを防ぐ */
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-button {
  background-color: #0095f6; /* インスタグラムの青色 */
  color: white;
  border: none;
  border-radius: 8px; /* 丸みを帯びたボタン */
  padding: 7px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.follow-button.is-following {
  background-color: #efefef; /* フォロー中の薄い背景色 */
  color: #262626; /* 文字色 */
  border: 1px solid #dbdbdb; /* 細いボーダー */
}

.header-middle {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 80px; /* アイコンと統計情報の間隔 */
}

.icon-container {
  width: 150px; /* アイコンのサイズ */
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; /* 縮小されないように */
}

.profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 画像の比率を保ちつつコンテナに収める */
}

.user-stats {
  display: flex;
  flex-grow: 1; /* 残りのスペースを埋める */
  justify-content: space-around; /* 統計項目を均等配置 */
  font-size: 16px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column; /* 縦並び */
  align-items: center;
}

.stat-value {
  font-weight: bold;
  font-size: 18px; /* 数値のサイズ */
}

.stat-label {
  color: #8e8e8e; /* ラベルの色 */
  font-size: 14px;
}

.full-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
}

.self-introduction {
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap; /* 改行を反映 */
}

.profile-content {
  border-top: 1px solid #dbdbdb; /* 区切り線 */
  padding-top: 20px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列グリッド */
  gap: 28px; /* グリッド間の隙間 */
}

.post-thumbnail {
  width: 100%;
  padding-top: 100%; /* 正方形のコンテナを作成 */
  position: relative;
  overflow: hidden;
  background-color: #eee; /* 画像がない場合の背景色 */
}

.post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 画像がコンテナに収まるように */
}

.no-posts-message, .loading-message {
  grid-column: 1 / -1; /* グリッド全体に表示 */
  text-align: center;
  padding: 50px;
  color: #8e8e8e;
  font-size: 18px;
}

/* レスポンシブ対応（簡易版） */
@media (max-width: 768px) {
  .header-middle {
    flex-direction: column; /* 縦並びに変更 */
    gap: 20px;
  }
  .icon-container {
    width: 100px;
    height: 100px;
  }
  .user-stats {
    width: 100%;
    justify-content: space-around;
  }
  .posts-grid {
    gap: 10px; /* スマホでは隙間を小さく */
  }
}
</style>
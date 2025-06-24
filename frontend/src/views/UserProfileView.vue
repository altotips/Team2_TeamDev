<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <h1 class="username">{{ userName }}</h1>
      </div>

      <div class="profile-details-row" v-if="!isLoading && !error">
        <div class="icon-container">
          <img :src="userIconUrl || '/images/default_profile_icon.png'" alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ fullName }}</div>
            <button v-if="!isMyProfile" :class="['follow-button', { 'is-following': isFollowing }]" @click="toggleFollow">
              {{ isFollowing ? 'フォロー中' : 'フォロー' }}
            </button>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ postsCount }}</span>
              <span class="stat-label">投稿</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ followingCount }}</span>
              <router-link to="/followlist" class="stat-label-link">
                <span class="stat-label">フォロー中</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

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

        <div v-if="error" class="error-message">
          プロフィールの読み込み中にエラーが発生しました。: {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js'; 

const route = useRoute();
const userStore = useUserStore();

const targetUserId = ref(null); 

const userName = ref(''); 
const userIconUrl = ref('');
const fullName = ref('');
const selfIntroduction = ref('');
const postsCount = ref(0);
const followingCount = ref(0); // ★ この値にフォロー数を格納
const isMyProfile = ref(false);
const isFollowing = ref(false);
const userPosts = ref([]);
const isLoading = ref(true);
const error = ref(null);

async function fetchUserProfileData(userIdToFetch) { 
  isLoading.value = true;
  error.value = null;
  try {
    // userStoreのgetUserアクションを呼び出し、特定のユーザー情報を取得
    const response = await userStore.getUser(userIdToFetch); 

    if (response && response.data) {
      const data = response.data; // バックエンドから返されたユーザーデータ全体

      userName.value = data.userName || ''; 
      userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png'; 
      fullName.value = data.fullName || '';
      selfIntroduction.value = data.selfIntroduction || '';
      
      // バックエンドからのレスポンスに直接 postsCount が含まれることを優先し、
      // なければ posts 配列の長さで計算
      postsCount.value = data.postsCount !== undefined ? data.postsCount : (data.posts ? data.posts.length : 0); 
      
      // 【重要】followingCount を設定
      // バックエンドからのレスポンスに直接 followingCount が含まれることを優先し、
      // なければ follows 配列の長さで計算
      followingCount.value = data.followingCount !== undefined ? data.followingCount : (data.follows ? data.follows.length : 0); 
      
      userPosts.value = data.posts || []; 
      
      isMyProfile.value = (userStore.id === userIdToFetch);
      // userStore.follows はログインユーザーがフォローしているリスト
      // その中に現在表示しているユーザーのID (userIdToFetch) が含まれているかを確認
      isFollowing.value = userStore.follows && userStore.follows.some(f => f.id === userIdToFetch);

    } else {
      throw new Error(`ユーザーID '${userIdToFetch}' のデータが見つかりませんでした。`);
    }
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching user profile:", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  const idFromRoute = parseInt(route.params.userId); 

  if (!isNaN(idFromRoute)) {
    targetUserId.value = idFromRoute;
    await fetchUserProfileData(targetUserId.value);
  } else {
    if (userStore.id) { 
        targetUserId.value = userStore.id;
        isMyProfile.value = true;
        await fetchUserProfileData(targetUserId.value);
    } else {
        error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
        isLoading.value = false;
    }
  }
});

watch(() => route.params.userId, async (newUserId) => {
  const id = parseInt(newUserId);
  if (!isNaN(id) && id !== targetUserId.value) {
    targetUserId.value = id;
    await fetchUserProfileData(targetUserId.value);
  }
});

const toggleFollow = async () => {
    if (!userStore.id) { 
        alert('ログインしていません。フォローできません。');
        return;
    }
    if (!targetUserId.value) return;

    try {
        if (isFollowing.value) {
            const success = await userStore.unfollow(targetUserId.value); 
            if (success) {
                isFollowing.value = false;
            } else {
                alert('フォロー解除に失敗しました。');
            }
        } else {
            const success = await userStore.follow(targetUserId.value); 
            if (success) {
                isFollowing.value = true;
            } else {
                alert('フォローに失敗しました。');
            }
        }
        // フォロー/アンフォロー後にプロフィール情報を再フェッチして、最新のフォロー数などを反映
        await fetchUserProfileData(targetUserId.value);
    } catch (err) {
        console.error('フォロー処理中にエラー:', err);
        alert('フォロー処理中にエラーが発生しました。');
    }
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
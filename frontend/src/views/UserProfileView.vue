<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <button class="back-button" @click="$router.go(-1)">
          ＜
        </button>
        <h1 class="username">{{ userName }}</h1>
      </div>

      <div class="profile-details-row" v-if="!isLoading && !error">
        <div class="icon-container">
          <img
            :src="userIconUrl && !userIconUrl.startsWith('http') ? `http://localhost:8080/uploads/${userIconUrl}` : (userIconUrl || '/images/default_profile_icon.png')"
            alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ fullName }}</div>
            <template v-if="isMyProfile">
              <div class="my-profile-actions">
                <button class="edit-profile-button" @click="goToEditProfile">プロフィール編集</button>
                <button class="logout-button" @click="handleLogout">ログアウト</button>
              </div>
            </template>
            <button v-else :class="['follow-button', { 'is-following': isFollowing }]" @click="toggleFollow">
              {{ followButtonText }}
            </button>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ postsCount }}</span>
              <span class="stat-label">投稿</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ displayedFollowingCount }}</span>
              <router-link :to="`/followlist?userId=${targetUserId}&type=following`" class="stat-label-link">
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
        <div v-if="isLoading" class="loading-message">
          投稿を読み込み中...
        </div>

        <div v-else-if="error" class="error-message">
          投稿の読み込み中にエラーが発生しました。: {{ error }}
        </div>

        <div v-else-if="userPosts.length === 0" class="no-posts-message">
          まだ投稿がありません。
        </div>

        <div v-else class="image-grid">
          <div v-for="post in userPosts" :key="post.id" class="image-item" @click="openModal(post)">
            <img
              :src="post.urlPhoto && !post.urlPhoto.startsWith('http') ? `http://localhost:8080/uploads/${post.urlPhoto}` : (post.urlPhoto || '/images/default_post_image.png')"
              :alt="post.content" class="post-image">
            <div class="post-overlay">
              <div class="overlay-stats">
                <span class="stat-icon">❤️</span>
                <span class="stat-number">{{ post.good }}</span>
                <span class="stat-icon">💬</span>
                <span class="stat-number">{{ post.comments ? post.comments.length : 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <ModalUserPostsView :show="showModal" :postData="selectedPostObj" @close="closeModal"
    @update:post="handlePostUpdate" />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js';
import { usePostStore } from '@/stores/postStore.js';
import ModalUserPostsView from '@/views/ModalUserPostsView.vue'; // Correct path

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const postStore = usePostStore();

const targetUserId = ref(null);

const userName = ref('');
const userIconUrl = ref('');
const fullName = ref('');
const selfIntroduction = ref('');
const postsCount = ref(0);
const isMyProfile = ref(false);
const isFollowing = ref(false);

const userPosts = ref([]);

const isLoading = ref(true);
const error = ref(null);

const displayedFollowingCount = ref(0);

const showModal = ref(false);
const selectedPostObj = ref(null);

const loggedInUserIsFollowing = computed(() => {
  if (!userStore.id || !targetUserId.value || !userStore.follows) {
    return false;
  }
  return userStore.follows.some(f => f.toUser && f.toUser.id === targetUserId.value);
});

const followButtonText = computed(() => {
  return isFollowing.value ? 'フォロー中' : 'フォロー';
});

const handleLogout = async () => {
  if (confirm('ログアウトしますか？')) {
    console.log('ログアウト処理を実行します');
    const success = await userStore.logout();
    if (success) {
      router.push('/');
    } else {
      // showToastMessage('ログアウトに失敗しました'); // Assuming showToastMessage is available
      alert('ログアウトに失敗しました');
    }
  }
};

const goToEditProfile = () => {
  router.push('/ProfileEdit');
};

async function fetchUserProfileData(userIdToFetch) {
  isLoading.value = true;
  error.value = null;
  userPosts.value = [];

  try {
    const response = await userStore.getUser(userIdToFetch);

    if (response && response.data) {
      const data = response.data;

      userName.value = data.userName || '';
      userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png';
      fullName.value = data.fullName || '';
      selfIntroduction.value = data.selfIntroduction || '';

      isMyProfile.value = (userStore.id === userIdToFetch);

      const targetUserFollowingList = await userStore.userFollowers(userIdToFetch);
      displayedFollowingCount.value = targetUserFollowingList ? targetUserFollowingList.filter(f => f.fromUser && f.fromUser.id === userIdToFetch).length : 0;

      await postStore.fetchUserPosts(userIdToFetch);
      // ここで、投稿のliked状態をuserStore.likesに基づいて設定します
      userPosts.value = postStore.userPosts.map(post => ({
        ...post,
        // userStore.likesがundefinedでないことを確認し、配列であればsomeメソッドを使用
        liked: userStore.likes && Array.isArray(userStore.likes)
          ? userStore.likes.some(like => like.postId === post.id)
          : false,
        animateHeart: false, // アニメーションの状態を追加
      }));
      postsCount.value = userPosts.value.length;

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

const initiateFetch = async (userId) => {
  if (userId) {
    targetUserId.value = userId;
    await fetchUserProfileData(targetUserId.value);
  } else if (userStore.id) {
    targetUserId.value = userStore.id;
    await fetchUserProfileData(targetUserId.value);
  } else {
    error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
    isLoading.value = false;
    router.push('/');
  }
};

watch(
  () => [route.params.userId, userStore.id],
  async ([newRouteUserId, newUserStoreId]) => {
    let idToFetch = null;
    const routeIdNum = parseInt(newRouteUserId);

    if (!isNaN(routeIdNum) && routeIdNum > 0) {
      idToFetch = routeIdNum;
    } else if (newUserStoreId && newUserStoreId > 0) {
      idToFetch = newUserStoreId;
    }

    if (idToFetch && (idToFetch !== targetUserId.value || (userStore.id !== null && isMyProfile.value !== (newUserStoreId === idToFetch)))) {
      console.log("Watch triggered by ID change or login status. Fetching user profile for:", idToFetch);
      // ログインユーザーのいいね情報を先に取得するようにします
      if (userStore.id) {
          await userStore.fetchLikes();
      }
      await initiateFetch(idToFetch);
    } else if (!idToFetch && !targetUserId.value && !error.value) {
      error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
      isLoading.value = false;
      router.push('/');
    }
    if (userStore.id) {
      await userStore.followers();
    }
  },
  { immediate: true }
);

watch(
  loggedInUserIsFollowing,
  (newValue) => {
    isFollowing.value = newValue;
  },
  { immediate: true }
);

const toggleFollow = async () => {
  if (!userStore.id) {
    // showToastMessage('ログインしていません。フォローできません。'); // Assuming showToastMessage is available
    alert('ログインしていません。フォローできません。');
    router.push('/');
    return;
  }
  if (!targetUserId.value) return;

  try {
    if (isFollowing.value) {
      const success = await userStore.unfollow(targetUserId.value);
      if (success) {
        // showToastMessage('フォローを解除しました。'); // Assuming showToastMessage is available
        alert('フォローを解除しました。');
      } else {
        // showToastMessage('フォロー解除に失敗しました。'); // Assuming showToastMessage is available
        alert('フォロー解除に失敗しました。');
      }
    } else {
      const success = await userStore.follow(targetUserId.value);
      if (success) {
        // showToastMessage('フォローしました。'); // Assuming showToastMessage is available
        alert('フォローしました。');
      } else {
        // showToastMessage('フォローに失敗しました。'); // Assuming showToastMessage is available
        alert('フォローに失敗しました。');
      }
    }
    await fetchUserProfileData(targetUserId.value);
    await userStore.followers();
  } catch (err) {
    console.error('フォロー処理中にエラー:', err);
    // showToastMessage('フォロー処理中にエラーが発生しました。'); // Assuming showToastMessage is available
    alert('フォロー処理中にエラーが発生しました。');
  }
};

const openModal = (post) => {
  selectedPostObj.value = post;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedPostObj.value = null;
};

/**
 * モーダルから投稿データの更新を受け取り、userPosts配列を更新するハンドラ
 * @param {Object} updatedPost - モーダルから送られてきた更新された投稿オブジェクト
 */
const handlePostUpdate = (updatedPost) => {
  const index = userPosts.value.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    // リアクティブ性を保ちつつ、該当する投稿オブジェクトのプロパティを更新
    // Object.assign を使用することで、参照を保ったままプロパティを更新できる
    Object.assign(userPosts.value[index], updatedPost);
    console.log(`投稿ID ${updatedPost.id} が更新されました。新しいいいね数: ${userPosts.value[index].good}`);
  }
};
</script>

---

<style scoped>
.profile-page {
  max-width: 935px;
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
  justify-content: flex-start;
  margin-bottom: 20px;
}

.back-button {
  background-color: transparent;
  border: none;
  color: #262626;
  font-size: 24px;
  margin-right: 15px;
  cursor: pointer;
  padding: 0;
}

.username {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-details-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 80px;
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
  position: relative;
}

.profile-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-of-icon-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 150px;
}

.name-and-button {
  display: flex;
  /* full-nameとボタンの配置を制御 */
  align-items: center; /* ★ 修正: 中央揃えに変更して高さを調整しやすくします */
  margin-bottom: 20px;
  /* 統計情報との間隔 */
  gap: 20px;
  /* full-nameとボタンの間の基本間隔 */
  flex-wrap: wrap; /* ボタンが複数行になる可能性を考慮 */
}

.full-name {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
  flex-shrink: 0; /* 縮小させない */
}

.my-profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 0; /* ★ 修正: 親要素で align-items を使うため、個別の margin-top はリセット */
  flex-wrap: wrap; /* ボタンが複数行になる可能性を考慮 */
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
  margin-top: 0; /* ★ 修正: 親要素で align-items を使うため、個別の margin-top はリセット */
}

.follow-button.is-following {
  background-color: #efefef;
  color: #262626;
  border: 1px solid #dbdbdb;
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
  white-space: nowrap;
  /* ボタンのテキストが改行されないように */
  flex-shrink: 0;
  /* flexアイテムが縮小されないように */
}

.edit-profile-button:hover,
.logout-button:hover {
  background-color: #fafafa;
}

.user-stats {
  display: flex;
  justify-content: flex-start;
  gap: 60px;
  font-size: 16px;
  text-align: left;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.profile-content {
  border-top: 1px solid #dbdbdb;
  padding-top: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.image-item {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  background-color: #eee;
  cursor: pointer;
  /* クリック可能であることを示す */
}

.image-item .post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  /* ホバー時のアニメーション */
}

/* --- オーバーレイ表示のための追加CSS --- */
.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  /* 半透明の黒で画像を暗くする */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  /* 初期状態では非表示 */
  transition: opacity 0.3s ease;
  /* フェードイン/アウトのアニメーション */
  pointer-events: none;
  /* オーバーレイがクリックを妨げないようにする */
}

.image-item:hover .post-overlay {
  opacity: 1;
  /* ホバー時に表示 */
  pointer-events: auto;
  /* ホバー時にクリック可能にする */
}

.image-item:hover .post-image {
  transform: scale(1.05);
  /* ホバー時に画像を少し拡大（任意） */
}

.overlay-stats {
  display: flex;
  color: white;
  font-size: 18px;
  font-weight: bold;
  gap: 20px;
  /* アイテム間のスペース */
}

.overlay-stats .stat-icon {
  margin-right: 5px;
}

.overlay-stats .stat-number {
  margin-right: 15px;
  /* 数字と次のアイコンの間のスペース */
}

/* --- 追加CSSここまで --- */


.no-posts-message,
.loading-message,
.error-message {
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
    flex-direction: column;
    /* 縦並びにする */
    align-items: flex-start;
    /* 左寄せに戻す */
    gap: 10px;
    margin-bottom: 15px;
  }

  .user-stats {
    justify-content: space-around;
    width: 100%;
    gap: 40px;
  }

  .image-grid {
    gap: 10px;
  }

  /* モバイルではオーバーレイは通常表示しない、またはシンプルな表示にするなど検討 */
  .post-overlay {
    /* モバイルでのオーバーレイ表示を無効にする例 */
    display: none;
  }

  .follow-button {
    width: 100%;
    /* モバイルでは幅いっぱいに表示 */
    margin-top: 10px;
  }

  .my-profile-actions {
    width: 100%;
    /* モバイルで幅いっぱいに表示 */
    margin-top: 10px; /* モバイルでの縦方向の間隔を調整 */
  }

  .edit-profile-button,
  .logout-button {
    width: 48%;
    /* モバイルで横に並べる場合の例 */
  }
}
</style>
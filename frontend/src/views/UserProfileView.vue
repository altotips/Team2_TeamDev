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
          <img :src="userIconUrl || '/images/default_profile_icon.png'" alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ fullName }}</div>
            <button v-if="!isMyProfile" :class="['follow-button', { 'is-following': isFollowing }]"
              @click="toggleFollow">
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
            <img :src="post.urlPhoto || '/images/default_post_image.png'" :alt="post.content" class="post-image">
          </div>
        </div>
      </div>
    </main>
  </div>

  <ModalUserPostsView :show="showModal" :postData="selectedPostObj" @close="closeModal" />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js';
import { usePostStore } from '@/stores/postStore.js';
import ModalUserPostsView from '@/views/ModalUserPostsView.vue';

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
  return userStore.follows.some(f => f.id === targetUserId.value);
});

const followButtonText = computed(() => {
  return isFollowing.value ? 'フォロー中' : 'フォロー';
});

async function fetchUserProfileData(userIdToFetch) {
  isLoading.value = true;
  error.value = null;
  userPosts.value = [];

  try {
    const response = await userStore.getUser(userIdToFetch); // 対象ユーザーの基本情報を取得

    if (response && response.data) {
      const data = response.data;

      userName.value = data.userName || '';
      userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png';
      fullName.value = data.fullName || '';
      selfIntroduction.value = data.selfIntroduction || '';

      // ★ ここで新しく追加した userStore.userFollowers(userId) を呼び出してフォロー人数を取得します
      const targetUserFollowingList = await userStore.userFollowers(userIdToFetch);
      displayedFollowingCount.value = targetUserFollowingList ? targetUserFollowingList.length : 0; // nullチェックも追加

      isMyProfile.value = (userStore.id === userIdToFetch);
      // ログインユーザーが対象ユーザーをフォローしているかの判定（既存ロジック）
      isFollowing.value = userStore.follows && userStore.follows.some(f => f.id === userIdToFetch);

      await postStore.fetchUserPosts(userIdToFetch);
      userPosts.value = postStore.userPosts;
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
// async function fetchUserProfileData(userIdToFetch) {
//   isLoading.value = true;
//   error.value = null;
//   userPosts.value = [];

//   try {
//     const response = await userStore.getUser(userIdToFetch);

//     if (response && response.data) {
//       const data = response.data;

//       userName.value = data.userName || '';
//       userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png';
//       fullName.value = data.fullName || '';
//       selfIntroduction.value = data.selfIntroduction || '';

//       displayedFollowingCount.value = data.followingCount !== undefined ? data.followingCount : 0;

//       isMyProfile.value = (userStore.id === userIdToFetch);
//       isFollowing.value = loggedInUserIsFollowing.value;

//       await postStore.fetchUserPosts(userIdToFetch);
//       userPosts.value = postStore.userPosts;

//       postsCount.value = userPosts.value.length;

//     } else {
//       throw new Error(`ユーザーID '${userIdToFetch}' のデータが見つかりませんでした。`);
//     }
//   } catch (err) {
//     error.value = err.message;
//     console.error("Error fetching user profile:", err);
//   } finally {
//     isLoading.value = false;
//   }
// }

const initiateFetch = async (userId) => {
  if (userId) {
    targetUserId.value = userId;
    await fetchUserProfileData(targetUserId.value);
  } else {
    error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
    isLoading.value = false;
  }
};

watch(
  () => [route.params.userId, userStore.id],
  async ([newRouteUserId, newUserStoreId]) => {
    let idToFetch = null;
    const routeIdNum = parseInt(newRouteUserId);

    if (!isNaN(routeIdNum) && routeIdNum > 0) {
      idToFetch = routeIdNum;
    }
    else if (newUserStoreId && newUserStoreId > 0) {
      idToFetch = newUserStoreId;
    }

    if (idToFetch && idToFetch !== targetUserId.value) {
      console.log("Watch triggered by ID change. Fetching user profile for:", idToFetch);
      await initiateFetch(idToFetch);
    }
    else if (!idToFetch && !targetUserId.value && !error.value) {
      error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
      isLoading.value = false;
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
    alert('ログインしていません。フォローできません。');
    return;
  }
  if (!targetUserId.value) return;

  try {
    if (isFollowing.value) {
      const success = await userStore.unfollow(targetUserId.value);
      if (!success) {
        alert('フォロー解除に失敗しました。');
      }
    } else {
      const success = await userStore.follow(targetUserId.value);
      if (!success) {
        alert('フォローに失敗しました。');
      }
    }
    await fetchUserProfileData(targetUserId.value);
  } catch (err) {
    console.error('フォロー処理中にエラー:', err);
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
</script>


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
  align-items: center;
  margin-bottom: 30px;
  gap: 30px;
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

/* 投稿グリッドのコンテナ */
.image-grid { /* posts-grid の中身をこちらに合わせる */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

/* 各投稿アイテムのコンテナ */
.image-item {
  width: 100%;
  padding-top: 100%; /* アスペクト比を1:1に保つ */
  position: relative;
  overflow: hidden;
  background-color: #eee; /* 画像読み込み中の背景色 */
}

/* 投稿画像そのもの */
.image-item .post-image { /* .image-item の中の .post-image を指定 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 画像がボックスに収まるようにトリミング */
}

.no-posts-message,
.loading-message,
.error-message { /* エラーメッセージも中央揃えにするため追加 */
  grid-column: 1 / -1; /* グリッド全体に広がるように */
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
    gap: 20px;
    margin-bottom: 20px;
  }

  .user-stats {
    justify-content: space-around;
    width: 100%;
    gap: 40px;
  }

  .image-grid { /* posts-grid の中身をこちらに合わせる */
    gap: 10px;
  }
}
</style>
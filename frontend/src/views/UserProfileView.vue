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
            <div class="profile-buttons">
              <button v-if="isMyProfile" class="edit-profile-button" @click="goToEditProfile">プロフィール編集</button>
              <button v-if="isMyProfile" class="logout-button" @click="handleLogout">ログアウト</button>
              <button v-else :class="['follow-button', { 'is-following': isFollowing }]" @click="toggleFollow">
                {{ followButtonText }}
              </button>
            </div>
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
            <img :src="post.urlPhoto && !post.urlPhoto.startsWith('http') ? `http://localhost:8080/uploads/${post.urlPhoto}` : (post.urlPhoto || '/images/default_post_image.png')" :alt="post.content" class="post-image">
            <div class="post-overlay">
              <div class="overlay-stats">
                <span class="stat-icon">❤️</span>
                <span class="stat-number">{{ post.good }}</span>
                <span class="stat-icon">💬</span>
                <span class="stat-number">{{ post.comments.length }}</span>
              </div>
            </div>
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
import { useToast } from '@/composables/useToast.js'
// defaultIconのインポートはテンプレートで使用されていないためコメントアウトまたは削除
// import defaultIcon from '@/images/default_icon.png';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const postStore = usePostStore();
const { showToastMessage } = useToast()

  const targetUserId = ref(null); // 表示中のユーザーのID

  const userName = ref('');
  const userIconUrl = ref('');
  const fullName = ref('');
  const selfIntroduction = ref('');
  const postsCount = ref(0);
  const isMyProfile = ref(false); // 自分のプロフィールかどうかを判定
  const isFollowing = ref(false); // ログインユーザーがこのプロフィールをフォローしているか

  const userPosts = ref([]);

  const isLoading = ref(true);
  const error = ref(null);

  const displayedFollowingCount = ref(0); // 表示中のユーザーのフォロー中人数

  const showModal = ref(false);
  const selectedPostObj = ref(null);

  // ログインユーザーが対象ユーザーをフォローしているかの判定ロジック
  // userStore.follows はログインユーザーがフォローしているリスト
  const loggedInUserIsFollowing = computed(() => {
    if (!userStore.id || !targetUserId.value || !userStore.follows) {
      return false;
    }
    // userStore.follows の各要素 f が持つ toUser.id と targetUserId.value を比較
    // ※ f.toUser が存在することを前提としています。APIレスポンスの構造をご確認ください。
    return userStore.follows.some(f => f.toUser && f.toUser.id === targetUserId.value);
  });

  const followButtonText = computed(() => {
    return isFollowing.value ? 'フォロー中' : 'フォロー';
  });

  // ログアウト処理
  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      console.log('ログアウト処理を実行します');
      const success = await userStore.logout();
      if (success) {
        router.push('/login'); // ログアウト後にログイン画面に遷移
      } else {
        alert('ログアウトに失敗しました');
      }
    }
  };

  // プロフィール編集画面へ遷移
  const goToEditProfile = () => {
    router.push('/ProfileEdit'); // プロフィール編集画面へ遷移
  };

  async function fetchUserProfileData(userIdToFetch) {
    isLoading.value = true;
    error.value = null;
    userPosts.value = [];

    try {
      const response = await userStore.getUser(userIdToFetch); // 対象ユーザーの基本情報を取得

      if (response && response.data) {
        const data = response.data;

        userName.value = data.userName || '';
        userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png'; // デフォルトアイコンパスも考慮
        fullName.value = data.fullName || '';
        selfIntroduction.value = data.selfIntroduction || '';

        // ★ 自分のプロフィールかどうかを判定
        isMyProfile.value = (userStore.id === userIdToFetch);

        // ★ フォロー中の人数を取得 (userStore.userFollowers を使用)
        // userStore.jsにこのメソッドがあることを前提としています
        const targetUserFollowingList = await userStore.userFollowers(userIdToFetch);
        displayedFollowingCount.value = targetUserFollowingList ? targetUserFollowingList.length : 0;

        // ユーザーの投稿を取得
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

  const initiateFetch = async (userId) => {
  if (userId) {
    targetUserId.value = userId; // targetUserId を設定
    await fetchUserProfileData(targetUserId.value);
  } else {
    error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
    isLoading.value = false;
  }
};

async function fetchUserProfileData(userIdToFetch) {
  isLoading.value = true;
  error.value = null;
  userPosts.value = [];

  try {
    const response = await userStore.getUser(userIdToFetch); // 対象ユーザーの基本情報を取得

    if (response && response.data) {
      const data = response.data;

      userName.value = data.userName || '';
      userIconUrl.value = data.urlIcon || '/images/default_profile_icon.png'; // デフォルトアイコンパスも考慮
      fullName.value = data.fullName || '';
      selfIntroduction.value = data.selfIntroduction || '';

      // ★ 自分のプロフィールかどうかを判定
      isMyProfile.value = (userStore.id === userIdToFetch);

      // ★ フォロー中の人数を取得 (userStore.userFollowers を使用)
      // userStore.jsにこのメソッドがあることを前提としています
      const targetUserFollowingList = await userStore.userFollowers(userIdToFetch);
      displayedFollowingCount.value = targetUserFollowingList ? targetUserFollowingList.length : 0;

      // ユーザーの投稿を取得
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



// ルートパラメータ (userId) とログインID (userStore.id) の変更を監視
    watch(
    () => [route.params.userId, userStore.id],
    async ([newRouteUserId, newUserStoreId]) => {
      let idToFetch = null;
      const routeIdNum = parseInt(newRouteUserId);

      if (!isNaN(routeIdNum) && routeIdNum > 0) {
        idToFetch = routeIdNum;
      } else if (newUserStoreId && newUserStoreId > 0) {
        // route.params.userId がない場合や、不正な値の場合は、ログイン中のユーザーのプロフィールを表示
        idToFetch = newUserStoreId;
      }

      // 取得対象のユーザーIDが変更された場合、または同じIDでもログイン状態が変わった場合に再フェッチ
      if (idToFetch && (idToFetch !== targetUserId.value || (userStore.id !== null && isMyProfile.value !== (newUserStoreId === idToFetch)))) {
        console.log("Watch triggered by ID change or login status. Fetching user profile for:", idToFetch);
        await initiateFetch(idToFetch);
      } else if (!idToFetch && !targetUserId.value && !error.value) {
        error.value = "有効なユーザーIDが指定されていないか、ログインしていません。";
        isLoading.value = false;
      }
      // ログインユーザーのフォローリストを更新（フォローボタンの状態反映のため）
      if (userStore.id) {
        await userStore.followers();
      }
    },
    { immediate: true } // コンポーネントがマウントされた直後にも実行
  );

  // ログインユーザーが対象ユーザーをフォローしているかのcomputedプロパティの変更を監視
  watch(
    loggedInUserIsFollowing,
    (newValue) => {
      isFollowing.value = newValue;
    },
    { immediate: true }
  );

const toggleFollow = async () => {
  if (!userStore.id) {
    showToastMessage('ログインしていません。フォローできません。');
    return;
  }
  if (!targetUserId.value) return;

  try {
    if (isFollowing.value) {
      const success = await userStore.unfollow(targetUserId.value);
      if (success) {
        showToastMessage('フォローを解除しました。');
      } else {
        showToastMessage('フォロー解除に失敗しました。');
      }
    } else {
      const success = await userStore.follow(targetUserId.value);
      if (success) {
        showToastMessage('フォローしました。');
      } else {
        showToastMessage('フォローに失敗しました。');
      }
    }
    // フォロー/フォロー解除後、ユーザーのプロフィールデータとログインユーザーのフォローリストを再フェッチして表示を更新
    await fetchUserProfileData(targetUserId.value);
    await userStore.followers();
  } catch (err) {
    console.error('フォロー処理中にエラー:', err);
    showToastMessage('フォロー処理中にエラーが発生しました。');
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
/* 提供されたCSSと追加のCSSをここに貼り付けます */
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
    align-items: center;
    margin-bottom: 30px;
    gap: 30px;
  }

  .full-name {
    font-weight: bold;
    font-size: 16px;
    margin: 0;
  }

.profile-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
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
  white-space: nowrap; /* ボタンのテキストが改行されないように */
  flex-shrink: 0; /* flexアイテムが縮小されないように */
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
  cursor: pointer; /* クリック可能であることを示す */
}

.image-item .post-image {
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
  pointer-events: none; /* オーバーレイがクリックを妨げないようにする */
}

.image-item:hover .post-overlay {
  opacity: 1; /* ホバー時に表示 */
  pointer-events: auto; /* ホバー時にクリック可能にする */
}

.image-item:hover .post-image {
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
  margin-right: 5px;
  /* 例としてFont Awesomeなどのアイコンライブラリを使用する場合、
     ここに適切なスタイルを追加してください。今回は絵文字を使用。 */
}

.overlay-stats .stat-number {
  margin-right: 15px; /* 数字と次のアイコンの間のスペース */
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

  .image-grid {
    gap: 10px;
  }

  /* モバイルではオーバーレイは通常表示しない、またはシンプルな表示にするなど検討 */
  .post-overlay {
    /* モバイルでのオーバーレイ表示を無効にする例 */
    display: none;
  }
}
</style>
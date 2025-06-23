<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-top">
        <h1 class="username">{{ displayedUser.userName }}</h1>
      </div>

      <div class="profile-details-row">
        <div class="icon-container">
          <img :src="displayedUser.urlIcon || '/images/default_profile_icon.png'" alt="User Icon" class="profile-icon">
        </div>

        <div class="right-of-icon-info">
          <div class="name-and-button">
            <div class="full-name">{{ displayedUser.fullName }}</div>
            <button :class="['follow-button', { 'is-following': isFollowing }]" @click="toggleFollow">
              {{ isFollowing ? 'フォロー中' : 'フォロー' }}
            </button>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ postStore.userPosts.length }}</span>
              <span class="stat-label">投稿</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ displayedUser.followingCount }}</span>
              <router-link :to="{ path: '/followlist', query: { userName: displayedUser.userName, isMyProfile: false } }" class="stat-label-link">
                <span class="stat-label">フォロー中</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="self-introduction">{{ displayedUser.selfIntroduction }}</div>
    </header>

    <main class="profile-content">
      <div class="posts-grid">
        <div v-for="post in postStore.userPosts" :key="post.id" class="post-thumbnail" @click="openPostModal(post.id)">
          <img :src="post.urlPhoto || '/images/default_post_image.png'" :alt="post.content" class="post-image">
        </div>

        <div v-if="postStore.userPosts.length === 0 && !isLoading" class="no-posts-message">
          まだ投稿がありません。
        </div>

        <div v-if="isLoading" class="loading-message">
          読み込み中...
        </div>
      </div>
    </main>
  </div> <ModalUserPostsView :show="showModal" :post-id="selectedPostId" @close="closePostModal" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePostStore } from '@/stores/postStore.js';
import { useUserStore } from '@/stores/userStore.js';
import ModalUserPostsView from '@/views/ModalUserPostsView.vue';

const route = useRoute();
const postStore = usePostStore();
const userStore = useUserStore();

// 表示するユーザーのプロフィール情報を保持するリアクティブ変数
const displayedUser = ref({
  id: null,
  userName: '読み込み中...',
  urlIcon: null,
  fullName: '',
  selfIntroduction: '',
  followingCount: 0,
});

const isLoading = ref(true); // データ読み込み中の状態

// 他者のプロフィール画面なので、isMyProfileは常にfalse
// ただし、厳密にはログインユーザーのIDとURLのIDを比較すべきですが、
// ご要望に合わせて今回は「他者」固定とします。
const isMyProfile = ref(false); // ★他者のプロフィールなのでfalse固定

// ログインユーザーが現在表示しているユーザーをフォローしているかどうか
const isFollowing = computed(() => {
  // ログインしていない場合や、表示ユーザーのIDがない場合はフォロー状態を判定しない
  if (!userStore.id || !userStore.follows || !displayedUser.value.id) {
    return false;
  }
  // ログインユーザーのフォローリストの中に、表示中のユーザーのIDが含まれているかチェック
  return userStore.follows.some(followedUser => followedUser.id === displayedUser.value.id);
});

// プロフィール情報をフェッチする関数
const fetchUserProfileAndPosts = async (userId) => {
  isLoading.value = true;
  try {
    // ユーザー情報を取得
    const userRes = await userStore.getUser(userId);
    if (userRes && userRes.data) {
      displayedUser.value = {
        id: userRes.data.id,
        userName: userRes.data.userName,
        urlIcon: userRes.data.urlIcon,
        fullName: userRes.data.fullName,
        selfIntroduction: userRes.data.selfIntroduction,
        // 他のユーザーのフォローカウントもAPIから取得したデータを使用
        followingCount: userRes.data.follows ? userRes.data.follows.length : 0,
      };
    } else {
      console.warn(`ユーザーID ${userId} の情報が見つかりません。`);
      // ユーザーが見つからない場合の表示を考慮
      displayedUser.value = { // 初期値に戻すか、エラーメッセージを表示
        id: null,
        userName: 'ユーザーが見つかりません',
        urlIcon: null,
        fullName: '',
        selfIntroduction: '',
        followingCount: 0,
      };
    }

    // 投稿情報を取得
    await postStore.fetchUserPosts(userId);

  } catch (err) {
    console.error('プロフィール情報の取得中にエラー:', err);
    // エラー表示などのハンドリング
  } finally {
    isLoading.value = false;
  }
};

// フォロー/フォロー解除の切り替え
const toggleFollow = async () => {
  if (!userStore.id) {
    console.warn('ログインしていません。フォローできません。');
    // ログインを促すなどのUIフィードバック
    return;
  }

  if (!displayedUser.value.id) {
    console.error('表示中のユーザーIDが不明です。');
    return;
  }

  // isFollowing の現在の値に基づいてフォロー/フォロー解除を決定
  if (isFollowing.value) {
    // フォロー中の場合 -> フォロー解除
    await userStore.unfollow(displayedUser.value.id);
    console.log(`${displayedUser.value.userName} のフォローを解除しました。`);
  } else {
    // フォロー中でない場合 -> フォロー
    await userStore.follow(displayedUser.value.id);
    console.log(`${displayedUser.value.userName} をフォローしました。`);
  }
  // フォロー状態が変更されたら、ログインユーザーのフォローリストを再取得して isFollowing を更新
  await userStore.followers(); // userStore内のfollowsを最新にする
};


// --- モーダル関連のロジック ---
const showModal = ref(false);
const selectedPostId = ref(null);

const openPostModal = (postId) => {
  selectedPostId.value = postId;
  showModal.value = true;
};

const closePostModal = () => {
  showModal.value = false;
  selectedPostId.value = null;
};
// --- モーダル関連のロジックここまで ---

// コンポーネントがマウントされたとき、またはルートパラメータが変更されたときにプロフィールをフェッチ
onMounted(async () => {
  const userId = parseInt(route.params.userId); // URLからユーザーIDを取得
  if (userId) {
    await fetchUserProfileAndPosts(userId);
  } else {
    console.warn('URLにユーザーIDが見つかりません。');
    // userIdがない場合のエラーハンドリングやデフォルト表示
    isLoading.value = false;
  }
});

// ルートパラメータ (userId) が変更されたときにプロフィールを再フェッチするウォッチャー
watch(() => route.params.userId, async (newUserId) => {
  const userId = parseInt(newUserId);
  if (userId) {
    await fetchUserProfileAndPosts(userId);
  } else {
    console.warn('表示するユーザーIDが特定できません。');
    isLoading.value = false;
  }
});
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
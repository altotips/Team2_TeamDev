<template>
  <div class="follow-list-page">
    <div class="header">
      <button class="back-button" @click="$router.go(-1)">
        ＜
      </button>
      <h2 class="followed-user-name">{{ currentUserName }}</h2>
    </div>

    <h1 class="page-title">フォロー一覧</h1>

    <div v-if="isLoading" class="loading-message">
      読み込み中...
    </div>

    <div v-else-if="error" class="error-message">
      エラーが発生しました: {{ error.message }}
    </div>

    <div v-else-if="followedUsers.length === 0" class="no-follows-message">
      まだ誰もフォローしていません。
    </div>

    <ul v-else class="follow-list">
      <li v-for="user in followedUsers" :key="user.id" class="follow-item">
        <div class="user-info" @click="goToUserProfile(user.id)">
          <div class="icon-container">
            <img :src="user.urlIcon || '/images/default_profile_icon.png'" alt="User Icon" class="user-icon">
          </div>
          <div class="text-info">
            <span class="username">{{ user.userName }}</span>
            <span class="fullname">{{ user.fullName }}</span>
          </div>
        </div>
        <button v-if="showUnfollowButton" class="unfollow-button" @click="unfollow(user.id)">解除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // watchをインポート
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js'; // userStoreをインポート

const route = useRoute();
const router = useRouter();
const userStore = useUserStore(); // userStoreインスタンスを作成

const isLoading = ref(false);
const error = ref(null);
const followedUsers = ref([]); // 表示するフォローユーザーのリスト
const currentUserName = ref(''); // 現在表示しているフォローリストの所有者名
const showUnfollowButton = ref(false); // フォロー解除ボタンの表示/非表示を制御

// プロフィールページへの遷移
const goToUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
};


// フォローリストのデータを取得する関数
const fetchFollowedUsers = async () => {
  isLoading.value = true;
  error.value = null; // エラーをリセット

  const routeUserId = parseInt(route.params.userId); // URLパラメータのuserId (他者のプロフィールの場合)
  const isMyProfileRoute = route.query.isMyProfile === 'true'; // クエリパラメータのisMyProfile

  try {
    if (isMyProfileRoute && userStore.id) {
      // 自分のフォローリストを表示する場合
      currentUserName.value = userStore.userName || 'あなた'; // ログインユーザー名
      showUnfollowButton.value = true; // 自分のリストなので解除ボタン表示

      // userStore.follows が既にロードされているか確認
      if (userStore.follows && userStore.follows.length > 0) {
        followedUsers.value = userStore.follows;
      } else {
        // ロードされていなければフェッチ（ログイン時などに自動でロードされる場合もあるのでここでの再フェッチは念のため）
        const success = await userStore.followers();
        if (success) {
          followedUsers.value = userStore.follows;
        } else {
          error.value = new Error('自分のフォローリストの取得に失敗しました。');
          followedUsers.value = [];
        }
      }
    } else if (routeUserId) {
      // 他のユーザーのフォローリストを表示する場合
      showUnfollowButton.value = false; // 他者のリストなので解除ボタン非表示

      const res = await userStore.getUser(routeUserId); // 指定されたIDのユーザー情報を取得
      if (res && res.data) {
        currentUserName.value = res.data.userName; // そのユーザーのユーザー名
        // そのユーザーのフォローリストを直接取得（APIが提供している場合）
        // userStore.jsのgetUserメソッドが、ユーザー自身の情報だけでなく、そのユーザーのフォローリストも返すようにする必要があるかもしれません
        // 現在のuserStore.getUserはfollowsを返していないので、もしAPIが返すならres.data.followsを使う
        // 仮にAPIがユーザー情報と一緒にフォローリストを返さない場合、別のAPIコールが必要になる
        // 現状、userStore.jsのgetUserはfollowsを返していません。そのため、APIレスポンスの構造次第で以下の行は修正が必要です。
        followedUsers.value = res.data.follows || []; // ここはAPIのレスポンス構造に依存
      } else {
        error.value = new Error('ユーザーが見つからないか、フォローリストを取得できませんでした。');
        followedUsers.value = [];
        currentUserName.value = 'ユーザー不明';
      }
    } else {
      error.value = new Error('表示するフォローリストのユーザー情報が特定できません。');
      followedUsers.value = [];
      currentUserName.value = '不明なユーザー';
    }
  } catch (err) {
    console.error('フォローリストのフェッチ中にエラー:', err);
    error.value = err;
    followedUsers.value = [];
  } finally {
    isLoading.value = false;
  }
};

// フォロー解除処理
const unfollow = async (userIdToUnfollow) => {
  if (!userStore.id) {
    alert('ログインしていません。フォロー解除できません。');
    return;
  }
  if (!confirm(`${userIdToUnfollow} 番のユーザーのフォローを解除しますか？`)) {
    return;
  }

  const success = await userStore.unfollow(userIdToUnfollow);
  if (success) {
    alert(`${userIdToUnfollow} 番のユーザーのフォローを解除しました。`);
    // フォロー解除後、自分のフォローリストを再取得して表示を更新
    await userStore.followers(); // userStoreのfollowsを更新
    followedUsers.value = userStore.follows; // 表示リストも更新
  } else {
    alert('フォロー解除に失敗しました。');
  }
};

onMounted(() => {
  fetchFollowedUsers();
});

// URLパラメータが変更されたときにフォローリストを再フェッチ
watch(() => [route.params.userId, route.query.isMyProfile], () => {
  fetchFollowedUsers();
});
</script>

<style scoped>
.follow-list-page {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-title {
  /* text-align: center;  これを left に変更 */
  text-align: left; /* ★ここを変更 */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #262626;
}

.loading-message, .error-message, .no-follows-message {
  text-align: center;
  padding: 20px;
  color: #8e8e8e;
}

.follow-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.follow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.follow-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.user-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  font-size: 16px;
  color: #262626;
}

.fullname {
  font-size: 14px;
  color: #8e8e8e;
}

.unfollow-button {
  background-color: #efefef;
  color: #262626;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.unfollow-button:hover {
  background-color: #e0e0e0;
}
</style>
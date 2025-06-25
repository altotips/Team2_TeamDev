<template>
  <div class="follow-list-page">
    <div class="header">
      <button class="back-button" @click="$router.go(-1)">
        ＜
      </button>
      <h2 class="followed-user-name">{{ currentUserName }}</h2>
    </div>

    <h1 class="page-title">フォロー中一覧</h1>

    <div v-if="isLoading" class="loading-message">
      読み込み中...
    </div>

    <div v-else-if="error" class="error-message">
      エラーが発生しました: {{ error.message }}
    </div>

    <div v-else-if="usersInList.length === 0" class="no-follows-message">
      まだ誰もフォローしていません。
    </div>

    <ul v-else class="follow-list">
      <li v-for="user in usersInList" :key="user.id" class="follow-item">
        <div class="user-info" @click="goToUserProfile(user.id)">
          <div class="icon-container">
            <img :src="user.urlIcon ? `http://localhost:8080/uploads/${user.urlIcon}` : '/images/default_profile_icon.png'" alt="User Icon" class="user-icon">
          </div>
          <div class="text-info">
            <span class="username">{{ user.userName }}</span>
            <span class="fullname">{{ user.fullName }}</span>
          </div>
        </div>
        <button v-if="userStore.id && userStore.id === currentListOwnerId && listType === 'following'"
                class="unfollow-button" @click="unfollow(user.id)">解除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const error = ref(null);
const usersInList = ref([]);
const currentUserName = ref('');
const currentListOwnerId = ref(null);
const listType = ref(''); // 'following' のみになる想定

const goToUserProfile = (userId) => {
  if (route.params.userId && parseInt(route.params.userId) === userId) {
    return;
  }
  router.push(`/user/${userId}`);
};

const fetchUsersList = async () => {
  isLoading.value = true;
  error.value = null;
  usersInList.value = [];

  const routeUserId = parseInt(route.query.userId);
  const routeListType = route.query.type; // この値は常に 'following' になる想定

  try {
    let targetId = null;

    if (!isNaN(routeUserId)) {
      targetId = routeUserId;
      listType.value = 'following'; // 「フォロワー」リストは取得しないため、常に'following'
    } else if (userStore.id) {
      targetId = userStore.id;
      listType.value = 'following';
    } else {
      error.value = new Error('表示するユーザー情報が特定できません（ログインが必要です）。');
      currentUserName.value = '不明なユーザー';
      return;
    }

    currentListOwnerId.value = targetId;

    // ユーザー基本情報を取得
    const userRes = await userStore.getUser(targetId);
    if (userRes && userRes.data) {
      currentUserName.value = userRes.data.userName || 'ユーザー';
    } else {
      error.value = new Error(`ユーザーID ${targetId} の情報が見つかりませんでした。`);
      currentUserName.value = 'ユーザー不明';
      return;
    }

    // ★ 常に 'userFollowers' を呼び出す
    const listData = await userStore.userFollowers(targetId);
    
    // APIレスポンスの構造に合わせてマッピング
    // listDataが { id, fromUser, toUser } の配列を返し、
    // その中の toUser がフォローしているユーザー情報を持つ場合を想定
    usersInList.value = listData?.map(f => f.toUser) || [];

  } catch (err) {
    console.error('ユーザーリストのフェッチ中にエラー:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

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
    // フォロー解除後、表示しているリストが自分のフォローリストであれば再フェッチして更新
    if (userStore.id === currentListOwnerId.value) { // listTypeは常に'following'なので条件から外しました
      await fetchUsersList();
    }
    // ログインユーザーの follows プロパティも更新しておく
    await userStore.followers(); 
  } else {
    alert('フォロー解除に失敗しました。');
  }
};

watch(
  () => route.query.userId, // typeは常に'following'になるので、userIdのみを監視
  async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      console.log("Watch triggered by query change. Fetching list...");
      await fetchUsersList();
    }
  },
  { immediate: true }
);
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
  /* text-align: center;  これを left に変更 */
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
  cursor: pointer; /* <--- ADDED THIS LINE */
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
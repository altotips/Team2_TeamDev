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
            <img :src="getUserIconUrl(user.urlIcon)" alt="User Icon" class="user-icon" @error="handleImageError">
          </div>
          <div class="text-info">
            <span class="username">{{ user.userName }}</span>
            <span class="fullname">{{ user.fullName }}</span>
          </div>
        </div>
        <button v-if="userStore.id && userStore.id === currentListOwnerId"
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
const listType = ref('following'); // このページは常に'following'なので固定

// プロフィールアイコンのURLを生成するヘルパー関数
// デフォルト画像は public/images/default_profile_icon.png に配置する想定
const getUserIconUrl = (fileName) => {
  if (!fileName) {
    return '/images/default_profile_icon.png'; // ファイル名がない場合の代替アイコン
  }
  return `http://localhost:8080/uploads/${fileName}`; // バックエンドの画像配信パス
};

// 画像の読み込みに失敗した場合のハンドラー
const handleImageError = (event) => {
  event.target.src = '/images/default_profile_icon.png'; // エラー時の代替アイコン
};


const goToUserProfile = (userId) => {
  // 既にそのユーザーのプロフィールページにいる場合は何もしない
  if (route.params.userId && parseInt(route.params.userId) === userId) {
    return;
  }
  router.push(`/user/${userId}`);
};

const fetchUsersList = async () => {
  isLoading.value = true;
  error.value = null;
  usersInList.value = [];

  const routeUserId = parseInt(route.query.userId); // URLクエリパラメータからユーザーIDを取得
  // const routeListType = route.query.type; // このページは'following'固定なので不要

  try {
    let targetId = null;

    if (!isNaN(routeUserId)) {
      targetId = routeUserId; // URLに指定があればそれを使う
    } else if (userStore.id) {
      targetId = userStore.id; // なければログインユーザーのIDを使う
    } else {
      // どちらも特定できない場合
      error.value = new Error('表示するユーザー情報が特定できません（ログインが必要です）。');
      currentUserName.value = '不明なユーザー';
      return;
    }

    currentListOwnerId.value = targetId; // 現在表示しているリストのオーナーIDを保存

    // ユーザー基本情報を取得
    const userRes = await userStore.getUser(targetId);
    if (userRes && userRes.data) {
      currentUserName.value = userRes.data.userName || 'ユーザー';
    } else {
      error.value = new Error(`ユーザーID ${targetId} の情報が見つかりませんでした。`);
      currentUserName.value = 'ユーザー不明';
      return;
    }

    // ★ ここで userStore.userFollowers(targetId) が
    // targetId がフォローしているユーザーのリストを返すことを期待
    const listData = await userStore.userFollowers(targetId); 
    
    // APIレスポンスの構造に合わせてマッピング
    // listDataが { id, fromUser, toUser } の配列を返し、
    // その中の toUser がフォローしているユーザー情報を持つ場合を想定
    // toUserが存在しない場合や、res.dataが直接ユーザー配列の場合は適宜調整
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
    showToastMessage('ログインしていません。フォロー解除できません。');
    // alert('ログインしていません。フォロー解除できません。');
    return;
  }
  if (!confirm(`${usersInList.value.find(u => u.id === userIdToUnfollow)?.userName || userIdToUnfollow + '番のユーザー'} のフォローを解除しますか？`)) {
    return;
  }

  try {
    const success = await userStore.unfollow(userIdToUnfollow);
    if (success) {
      showToastMessage(`${usersInList.value.find(u => u.id === userIdToUnfollow)?.userName || 'ユーザー'} のフォローを解除しました。`);
      // フォロー解除後、表示しているリストが自分のフォローリストであれば再フェッチして更新
      if (userStore.id === currentListOwnerId.value) {
        await fetchUsersList();
      }
      // ログインユーザーの followers プロパティも更新しておく (useUserStoreのfollowers関数がフォロー/フォロワー数を更新する想定)
      await userStore.followers(); 
    } else {
      showToastMessage('フォロー解除に失敗しました。');
    }
  } catch (err) {
    console.error('フォロー解除中にエラー:', err);
    showToastMessage('フォロー解除中にエラーが発生しました。');
  }
};

watch(
  () => route.query.userId, 
  async (newUserId, oldUserId) => {
    // URLのクエリパラメータuserIdが変更されたらリストを再フェッチ
    if (newUserId !== oldUserId) {
      console.log("Watch triggered by query change. Fetching list...");
      await fetchUsersList();
    }
  },
  { immediate: true } // コンポーネントがマウントされた直後にも一度実行
);
</script>

<style scoped>
/* スタイルは変更なし */
.follow-list-page {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 15px;
  color: #262626;
}

.followed-user-name {
  font-size: 20px;
  font-weight: bold;
  color: #262626;
  flex-grow: 1; /* ユーザー名を中央に寄せつつ、スペースを占有 */
  text-align: center; /* 中央寄せ */
  transform: translateX(-20px); /* 戻るボタンの分を相殺して見た目を中央に寄せる */
}

.page-title {
  text-align: left;
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
  cursor: pointer; /* クリック可能であることを視覚的に示す */
  flex-grow: 1; /* スペースを占有してクリックしやすくする */
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